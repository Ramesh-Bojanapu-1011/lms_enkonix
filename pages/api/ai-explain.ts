import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  success: boolean;
  data?: {
    answer: string;
    explanation: string;
    sampleCode: string;
    codeLanguage: string;
  };
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  const { title, content } = req.body;

  if (!title || !content) {
    return res
      .status(400)
      .json({ success: false, error: "Title and content are required" });
  }

  try {
    // Construct search query
    const searchQuery = `${title} ${content} programming example explanation and code snippet with output of the above`;

    // Use Google Custom Search API
    const apiKey = process.env.GOOGLE_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !searchEngineId) {
      throw new Error("Google API credentials not configured");
    }

    // Call Google Custom Search API
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(
      searchQuery
    )}&num=10`;
    console.log("Fetching Google Search API:", searchUrl);

    const response = await fetch(searchUrl);

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract and process search results
    const aiResponse = await processGoogleResults(data, title, content);

    return res.status(200).json({
      success: true,
      data: aiResponse,
    });
  } catch (error) {
    console.error("Error generating AI explanation:", error);

    return res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate explanation. Please configure Google API keys in .env.local",
    });
  }
}

async function processGoogleResults(
  data: any,
  title: string,
  content: string
): Promise<{
  answer: string;
  explanation: string;
  sampleCode: string;
  codeLanguage: string;
}> {
  const items = data.items || [];

  if (items.length === 0) {
    throw new Error("No search results found");
  }

  // Check for AI Overview in search information
  let aiOverview = "";
  if (data.searchInformation?.formattedSearchTime) {
    // AI Overview might be in different fields depending on the API response
    aiOverview =
      data.answerBox?.answer ||
      data.answerBox?.snippet ||
      data.knowledgeGraph?.description ||
      "";
  }

  // Collect snippets and links from search results
  const snippets: string[] = [];
  const links: string[] = [];
  const programizLinks: string[] = [];
  const fullTexts: string[] = [];

  items.forEach((item: any) => {
    // Prioritize rich snippets and answer boxes
    if (item.pagemap?.metatags?.[0]?.["og:description"]) {
      fullTexts.push(item.pagemap.metatags[0]["og:description"]);
    }

    if (item.snippet) {
      snippets.push(item.snippet);
    }

    if (item.link) {
      // Separate Programiz links for priority
      if (item.link.includes("programiz.com")) {
        programizLinks.push(item.link);
      } else {
        links.push(item.link);
      }
    }
  });

  // Detect programming language
  const codeLanguage = detectLanguage(title, content);

  // Try to fetch AI Overview and detailed content from top results
  let detailedContent = "";
  let aiGeneratedExplanation = "";
  let extractedExplanation = "";

  // Prioritize Programiz links first, then other links
  const prioritizedLinks = [...programizLinks, ...links];

  // Try multiple sources for better content
  for (let i = 0; i < Math.min(5, prioritizedLinks.length); i++) {
    try {
      const pageResponse = await fetch(prioritizedLinks[i], {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: AbortSignal.timeout(5000),
      });

      if (pageResponse.ok) {
        const html = await pageResponse.text();

        // Extract AI overview or featured content if present
        const aiContent = extractAIOverview(html);
        if (aiContent && aiContent.length > 100) {
          aiGeneratedExplanation = aiContent;
        }

        // Extract explanation paragraphs from content
        if (!extractedExplanation) {
          extractedExplanation = extractExplanationFromHTML(html, title, content);
        }

        // Extract code if not found yet
        if (!detailedContent) {
          detailedContent = extractCodeFromHTML(html, codeLanguage);
        }

        // Break if we have all content
        if (aiGeneratedExplanation && detailedContent && extractedExplanation) {
          break;
        }
      }
    } catch (error) {
      console.log(`Could not fetch content from link ${i}:`, error);
    }
  }

  // Build answer - prioritize AI overview
  const answer =
    aiOverview ||
    snippets ||
    "Here's what I found about your question from Google search results.";

  // Build explanation - prioritize extracted and AI-generated content
  const explanation =
    extractedExplanation ||
    aiGeneratedExplanation ||
    (fullTexts.length > 0 ? fullTexts.join(" ").substring(0, 1000) : "") ||
    (snippets.length > 1
      ? snippets.slice(1, 5).join(" ").substring(0, 1000)
      : "") ||
    snippets[0] ||
    "Based on the search results, this concept is important in programming.";

  const formattedExplanation = formatExplanation(explanation);

  // Use extracted code or generate based on detected patterns
  const sampleCode =
    detailedContent ||
    extractCodeFromSnippets(snippets, codeLanguage) ||
    extractCodeFromSnippets(fullTexts, codeLanguage) ||
    generateSampleCode(title, content, codeLanguage);

  return {
    answer: Array.isArray(answer) ? answer.join(" ") : answer,
    explanation: formattedExplanation,
    sampleCode,
    codeLanguage,
  };
}

function extractExplanationFromHTML(html: string, title: string, content: string): string {
  // Extract meaningful explanation paragraphs from HTML
  const cleanHTML = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "");

  // Patterns to extract educational content
  const contentPatterns = [
    // Main content areas
    /<article[^>]*>([\s\S]*?)<\/article>/gi,
    /<main[^>]*>([\s\S]*?)<\/main>/gi,
    // Specific content divs
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<div[^>]*class="[^"]*tutorial[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<div[^>]*class="[^"]*explanation[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    // Paragraph groups
    /<div[^>]*>([\s\S]*?)<\/div>/gi,
  ];

  let bestExplanation = "";
  let maxRelevance = 0;

  for (const pattern of contentPatterns) {
    const matches = cleanHTML.matchAll(pattern);
    for (const match of matches) {
      // Extract paragraphs from matched content
      const paragraphs = match[1].match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
      if (!paragraphs || paragraphs.length === 0) continue;

      // Clean and combine paragraphs
      let explanation = paragraphs
        .map(p => 
          p.replace(/<[^>]+>/g, " ")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, " ")
            .replace(/\s+/g, " ")
            .trim()
        )
        .filter(p => p.length > 50 && p.length < 500)
        .slice(0, 5)
        .join(" ");

      if (explanation.length < 100) continue;

      // Calculate relevance based on keywords
      const keywords = (title + " " + content).toLowerCase().split(/\s+/);
      const explanationLower = explanation.toLowerCase();
      let relevance = 0;
      
      keywords.forEach(keyword => {
        if (keyword.length > 3 && explanationLower.includes(keyword)) {
          relevance++;
        }
      });

      // Prefer explanations with code-related terms
      if (explanationLower.includes("example")) relevance += 2;
      if (explanationLower.includes("code")) relevance += 2;
      if (explanationLower.includes("function")) relevance += 1;
      if (explanationLower.includes("syntax")) relevance += 1;
      if (explanationLower.includes("output")) relevance += 1;

      if (relevance > maxRelevance && explanation.length >= 200 && explanation.length <= 1200) {
        maxRelevance = relevance;
        bestExplanation = explanation;
      }
    }
  }

  return bestExplanation.substring(0, 1000);
}

function formatExplanation(raw: string): string {
  // Normalize whitespace and add soft structure for readability
  let text = raw.replace(/\s+/g, " ").trim();

  const markers = [
    "example",
    "program",
    "code",
    "output",
    "explanation",
    "approach",
    "steps",
  ];

  markers.forEach((marker) => {
    const regex = new RegExp(`(\\b${marker}\\b)`, "ig");
    text = text.replace(regex, "\n\n$1");
  });

  text = text.replace(/(if\s+else|if\s*\(|else\s*if|else\s)/gi, "\n$1");

  if (text.length > 1400) {
    text = text.slice(0, 1400) + "...";
  }

  return text.trim();
}

function extractAIOverview(html: string): string {
  // Look for AI-generated content patterns
  const patterns = [
    // Google AI Overview patterns
    /<div[^>]*class="[^"]*ai-overview[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<div[^>]*data-attrid="[^"]*AIOverview[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    // Featured snippets
    /<div[^>]*class="[^"]*featured-snippet[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    // Answer boxes
    /<div[^>]*class="[^"]*answer-box[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    // Rich results
    /<div[^>]*class="[^"]*kno-rdesc[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
  ];

  for (const pattern of patterns) {
    const matches = html.match(pattern);
    if (matches && matches.length > 0) {
      // Clean HTML and extract text
      let text = matches[0]
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim();

      if (text.length > 100 && text.length < 1500) {
        return text;
      }
    }
  }

  return "";
}

function extractCodeFromHTML(html: string, language: string): string {
  // Try to extract code blocks from HTML with improved patterns
  const codeBlockPatterns = [
    // Stack Overflow and GitHub style
    /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    // General code blocks
    /<code[^>]*class="[^"]*language-[^"]*"[^>]*>([\s\S]*?)<\/code>/gi,
    /<pre[^>]*class="[^"]*code[^"]*"[^>]*>([\s\S]*?)<\/pre>/gi,
    // Simple code tags
    /<code[^>]*>([\s\S]*?)<\/code>/gi,
    /<pre[^>]*>([\s\S]*?)<\/pre>/gi,
    // Markdown code blocks
    /```[\w]*\n([\s\S]*?)```/g,
  ];

  let bestCode = "";
  let maxLength = 0;

  for (const pattern of codeBlockPatterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      // Clean HTML tags and decode entities
      let code = (match[1] || match[0])
        .replace(/<[^>]+>/g, "")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .trim();

      // Prefer code blocks between 50-2000 chars, longer is better
      if (code.length >= 50 && code.length <= 2000 && code.length > maxLength) {
        // Check if it looks like actual code
        if (
          code.includes("{") ||
          code.includes("(") ||
          code.includes("function") ||
          code.includes("class") ||
          code.includes("def ") ||
          code.includes("import ") ||
          code.includes("const ") ||
          code.includes("let ")
        ) {
          bestCode = code;
          maxLength = code.length;
        }
      }
    }
  }

  return bestCode;
}

function extractCodeFromSnippets(snippets: string[], language: string): string {
  // Look for code-like patterns in snippets
  for (const snippet of snippets) {
    // Check if snippet contains code indicators
    if (
      snippet.includes("function") ||
      snippet.includes("class") ||
      snippet.includes("def ") ||
      snippet.includes("const ") ||
      snippet.includes("let ") ||
      snippet.includes("import ")
    ) {
      return snippet;
    }
  }

  return "";
}

function detectLanguage(title: string, content: string): string {
  const text = (title + " " + content).toLowerCase();

  if (
    text.includes("python") ||
    text.includes("django") ||
    text.includes("flask")
  ) {
    return "python";
  }
  if (text.includes("java") && !text.includes("javascript")) {
    return "java";
  }
  if (text.includes("c++") || text.includes("cpp")) {
    return "cpp";
  }
  if (text.includes("typescript") || text.includes("tsx")) {
    return "typescript";
  }
  if (
    text.includes("react") ||
    text.includes("next") ||
    text.includes("javascript") ||
    text.includes("js")
  ) {
    return "javascript";
  }
  if (text.includes("html")) {
    return "html";
  }
  if (text.includes("css")) {
    return "css";
  }

  return "javascript"; // default
}

function generateSampleCode(
  title: string,
  content: string,
  language: string
): string {
  const lowerTitle = title.toLowerCase();
  const lowerContent = content.toLowerCase();

  // React/Hooks
  if (lowerTitle.includes("hook") || lowerContent.includes("usestate")) {
    return `import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}`;
  }

  // Next.js
  if (
    lowerTitle.includes("next") ||
    lowerContent.includes("getserversideprops")
  ) {
    return `export async function getServerSideProps(context) {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();

  return {
    props: { data }
  };
}

export default function Page({ data }) {
  return <div>{data.title}</div>;
}`;
  }

  // Python
  if (language === "python") {
    return `# Python example
def solve_problem(input_data):
    """
    Process the input and return result
    """
    result = []

    for item in input_data:
        # Process each item
        processed = item * 2
        result.append(processed)

    return result

# Usage
data = [1, 2, 3, 4, 5]
output = solve_problem(data)
print(output)`;
  }

  // Generic JavaScript
  return `// Example solution
function solveProblem(input) {
  if (!input) {
    throw new Error('Invalid input');
  }

  const result = input.map(item => {
    return item * 2;
  });

  return result;
}

// Usage
const data = [1, 2, 3, 4, 5];
const output = solveProblem(data);
console.log(output);`;
}
 