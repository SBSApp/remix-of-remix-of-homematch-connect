import { useSearchParams } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQs = () => {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get("userType") as "student" | "agent" || "student";

  const studentFAQs = [
    {
      question: "How do I create a profile?",
      answer: "Navigate to the Profile section from the bottom menu and fill in your details including bio and upload relevant documents."
    },
    {
      question: "How do I contact an agent?",
      answer: "In HomeMatch agents contact you first. Let the agent know you are interested in their listing by clicking the \"I'm interested!\" button."
    },
    {
      question: "What documents should I upload?",
      answer: "We recommend uploading your Passport/ID, Residence permit/visa, and Proof of enrollment. Additional documents like financial proof can improve your chances."
    },
    {
      question: "How do I save a listing?",
      answer: "Tap the heart icon on any listing to save it. You can view all saved listings in the Saved section."
    },
  ];

  const agentFAQs = [
    {
      question: "How do I add a new listing?",
      answer: "Tap the '+' button in the bottom navigation to add a new property listing with photos, description, and pricing."
    },
    {
      question: "How do I manage my leads?",
      answer: "Visit the Leads section to see all student inquiries and manage your conversations."
    },
    {
      question: "How do I update my profile?",
      answer: "Go to the Profile section to update your agency information, contact details, and verification documents."
    },
    {
      question: "How do students find my listings?",
      answer: "Students can browse and filter listings on their home page. Any student that is interested in the property will automatically appear on your home page in the Leads section."
    },
  ];

  const faqs = userType === "agent" ? agentFAQs : studentFAQs;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">FAQs</h1>
          <p className="text-muted-foreground mt-1">
            {userType === "agent" ? "Help for Agents" : "Help for Students"}
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        <div className="bg-card rounded-xl shadow-card p-4">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-card-foreground">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      <BottomNav userType={userType} />
    </div>
  );
};

export default FAQs;
