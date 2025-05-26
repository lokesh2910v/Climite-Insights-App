import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/pages/Layout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
type Message = {
  text: string;
  type: 'user' | 'assistant';
};

const API_KEY = import.meta.env.VITE_API_KEY;
const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const generateChatResponse = async (prompt: string, stateContext: string = "") => {
  try {
    const fullPrompt = `
      You are a helpful climate change expert assistant.

      Context:
      The user is asking about climate in ${stateContext ? stateContext : "India"}.

      Query:
      ${prompt}

      Instructions:
      1. Answer in 2–5 short, human-readable lines.
      2. No bullet points, markdown, or emojis.
      3. Mention 1–2 key facts or examples related to climate change.
    `;

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        }
      }),
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, no response.";
  } catch (error) {
    console.error("Error:", error);
    return "I'm sorry, I had trouble processing your question. Please try again later.";
  }
};

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm your climate assistant. Ask me anything about climate change in India or select a state.", type: 'assistant' }
  ]);
  const [input, setInput] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const prefilledQuestions = [
    "What's the average temperature trend?",
    "How is this state adapting to climate change?",
    "What are the major climate risks?",
    "How can I reduce my carbon footprint?"
  ];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStateSelection = async (stateName: string) => {
    setSelectedState(stateName);
    setIsLoading(true);

    const userMsg = `Tell me about climate change in ${stateName}`;
    setMessages(prev => [...prev, { text: userMsg, type: 'user' }]);

    const response = await generateChatResponse(userMsg, stateName);
    setMessages(prev => [...prev, { text: response, type: 'assistant' }]);

    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { text: userMessage, type: 'user' }]);
    setInput('');
    setIsLoading(true);

    const response = await generateChatResponse(userMessage, selectedState);
    setMessages(prev => [...prev, { text: response, type: 'assistant' }]);

    setIsLoading(false);
  };

  const handlePrefilledQuestion = async (question: string) => {
    setMessages(prev => [...prev, { text: question, type: 'user' }]);
    setIsLoading(true);

    const response = await generateChatResponse(question, selectedState);
    setMessages(prev => [...prev, { text: response, type: 'assistant' }]);

    setIsLoading(false);
  };

  return (
    <Layout>
      <div className="container py-8">
        <Card className="h-full flex flex-col p-4">
          <h2 className="text-xl font-semibold mb-4">Climate Assistant</h2>

          <div>
            <label className="block mb-2 text-sm font-medium text-foreground">Select State</label>
            <Select value={selectedState} onValueChange={handleStateSelection}>
              <SelectTrigger>
                <SelectValue placeholder="Select a state" />
              </SelectTrigger>
              <SelectContent className="max-h-80 overflow-y-auto">
                {indianStates.map((state) => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <br />

          <div className="mb-4 flex flex-wrap gap-2">
            {prefilledQuestions.map((question, index) => (
              <Button
                key={index}
                onClick={() => handlePrefilledQuestion(question)}
                variant="outline"
                size="sm"
                className="text-sm rounded-full"
                disabled={isLoading}
              >
                {question}
              </Button>
            ))}
          </div>

          <ScrollArea className="h-[400px] border rounded-lg mb-4 pr-2">
  <div ref={chatContainerRef} className="flex flex-col gap-2 p-2">
    {messages.map((msg, index) => (
      <div
        key={index}
        className={`p-3 rounded-lg max-w-[80%] whitespace-pre-wrap ${
          msg.type === "user" ? "bg-primary/10 ml-auto" : "bg-muted"
        }`}
      >
        {msg.text}
      </div>
    ))}

    {isLoading && (
      <div className="bg-muted p-3 rounded-lg max-w-[80%]">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    )}
  </div>
</ScrollArea>


          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about climate change..."
              className="flex-grow"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              Send
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default Chatbot;
