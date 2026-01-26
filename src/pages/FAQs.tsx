import { useSearchParams } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQs = () => {
  const [searchParams] = useSearchParams();
  const userType = (searchParams.get("userType") as "student" | "agent") || "student";

  const studentFAQs = [
    {
      question: "How do I create a profile?",
      answer:
        "Navigate to the Profile section from the sidebar and fill in or edit your details.",
    },
    {
      question: "How do I contact an agent?",
      answer:
        'In Fidii agents contact you first. Let the agent know you are interested in their listing by clicking the "I\'m interested!" button.',
    },
    {
      question: "How do I save a listing?",
      answer:
        "Click the heart icon on any listing to save it. You can view all saved listings in the Saved section.",
    },
  ];

  const agentFAQs = [
    {
      question: "How do I add a new listing?",
      answer:
        "Click 'Add Listing' in the sidebar to add a new property listing with photos, description, and pricing.",
    },
    {
      question: "How do I manage my leads?",
      answer:
        "Visit the Leads section to see all student inquiries and manage your conversations.",
    },
    {
      question: "How do I update my profile?",
      answer:
        "Go to the Profile section to update your agency information and/or personal details.",
    },
    {
      question: "How do students find my listings?",
      answer:
        "Students can browse and filter listings on their home page. Any student that is interested in the property will automatically appear on your home page in the Leads section.",
    },
  ];

  const faqs = userType === "agent" ? agentFAQs : studentFAQs;

  return (
    <AppLayout userType={userType}>
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">FAQs</h1>
          <p className="text-muted-foreground mt-1">
            {userType === "agent" ? "Help for Agents" : "Help for Students"}
          </p>
        </div>
      </div>

      <div className="p-8 max-w-3xl">
        <div className="bg-card rounded-xl shadow-card p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-card-foreground text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </AppLayout>
  );
};

export default FAQs;
