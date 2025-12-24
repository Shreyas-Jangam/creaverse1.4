import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Section = {
  title: string;
  intro?: string;
  bullets?: string[];
  footer?: string;
};

const sections: Section[] = [
  {
    title: "Eligibility",
    intro: "You must:",
    bullets: [
      "Be at least 18 years old",
      "Have the legal capacity to enter into binding agreements",
      "Comply with all applicable laws in your jurisdiction",
    ],
    footer: "By using the Platform, you represent and warrant that you meet these requirements.",
  },
  {
    title: "3. Account Registration",
    intro: "To access certain features, you must create an account. You agree to:",
    bullets: [
      "Provide accurate and up-to-date information",
      "Maintain the security of your account credentials",
      "Accept responsibility for all activities under your account",
    ],
    footer: "We reserve the right to suspend or terminate accounts that violate these Terms.",
  },
  {
    title: "4. Wallet Integration & Web3 Use",
    intro: "Certain features require connecting a blockchain wallet (e.g., MetaMask). You acknowledge:",
    bullets: [
      "You control your wallet and private keys",
      "Creaverse DAO does not store or recover private keys",
      "Blockchain transactions are irreversible",
      "You are solely responsible for all on-chain actions.",
    ],
  },
  {
    title: "5. Creovate DAO Tokens",
    intro: "Creovate DAO Tokens:",
    bullets: [
      "Are utility/governance tokens",
      "May be earned through participation (reviews, voting, contributions)",
      "Are not investment products or securities",
      "Creaverse DAO makes no guarantee of token value, liquidity, or future appreciation.",
    ],
  },
  {
    title: "6. NFTs & Digital Assets",
    intro: "Creators may mint NFTs representing creative works. You acknowledge:",
    bullets: [
      "NFTs do not automatically transfer copyright unless explicitly stated",
      "Ownership of an NFT does not equal ownership of underlying IP",
      "Smart contracts govern royalties and distributions",
      "All NFT interactions are subject to blockchain rules and smart contract logic.",
    ],
  },
  {
    title: "7. Creator Content & User Content",
    intro: "You retain ownership of content you create and upload. By submitting content, you grant Creaverse DAO a non-exclusive, worldwide, royalty-free license to:",
    bullets: [
      "Host, display, distribute, and promote your content",
      "Use content for platform functionality and marketing",
      "You are responsible for ensuring you have rights to any content you upload.",
    ],
  },
  {
    title: "8. AI-Powered Features",
    intro: "Creaverse DAO uses AI for content recommendations, moderation assistance, creator tools and analytics, and review quality assessment.",
    footer:
      'AI outputs are provided "as is" and may contain inaccuracies. Creaverse DAO is not liable for AI-generated decisions or recommendations.',
  },
  {
    title: "9. Messaging & Communication",
    intro: "Users may communicate via in-platform messaging. You agree not to:",
    bullets: [
      "Harass, spam, or abuse others",
      "Share illegal or harmful content",
      "Impersonate any person or entity",
    ],
    footer: "We may moderate or restrict messaging to maintain platform safety.",
  },
  {
    title: "10. DAO Governance",
    intro: "Token holders may:",
    bullets: [
      "Submit proposals",
      "Vote on governance matters",
      "Participate in community decisions",
    ],
    footer:
      "Governance outcomes are community-driven and may change platform rules, features, or token mechanics.",
  },
  {
    title: "11. Prohibited Activities",
    intro: "You agree not to:",
    bullets: [
      "Violate laws or regulations",
      "Engage in fraud, manipulation, or exploitation",
      "Attempt to hack, reverse engineer, or disrupt the Platform",
      "Use bots or automated systems without permission",
      "Launder money or finance illegal activities",
    ],
    footer: "Violations may result in suspension, termination, or legal action.",
  },
  {
    title: "12. Fees & Transactions",
    intro: "Some features may involve fees (e.g., minting, marketplace transactions). You acknowledge:",
    bullets: [
      "Fees may change",
      "Blockchain gas fees are outside our control",
      "All transactions are final",
    ],
  },
  {
    title: "13. Termination",
    intro: "We may suspend or terminate your access if you:",
    bullets: [
      "Violate these Terms",
      "Harm the community or platform",
      "Engage in illegal or abusive conduct",
    ],
    footer: "You may stop using the Platform at any time.",
  },
  {
    title: "14. Disclaimer of Warranties",
    intro: 'Creaverse DAO is provided "as is" and "as available." We make no warranties regarding:',
    bullets: [
      "Platform uptime",
      "Token value",
      "Smart contract performance",
      "AI accuracy",
      "Financial outcomes",
    ],
    footer: "Use the Platform at your own risk.",
  },
  {
    title: "15. Limitation of Liability",
    intro: "To the maximum extent permitted by law, Creaverse DAO shall not be liable for:",
    bullets: [
      "Loss of tokens or digital assets",
      "Financial losses",
      "Data loss",
      "Unauthorized access",
      "Smart contract failures",
    ],
  },
  {
    title: "16. Indemnification",
    intro: "You agree to indemnify and hold harmless Creaverse DAO from claims arising from:",
    bullets: [
      "Your content",
      "Your actions on the Platform",
      "Your violation of these Terms",
    ],
  },
  {
    title: "17. Privacy",
    intro:
      "Your use of the Platform is subject to our Privacy Policy, which explains how data is collected, stored, and used.",
  },
  {
    title: "18. Changes to Terms",
    intro:
      "We may update these Terms at any time. Continued use of the Platform constitutes acceptance of the updated Terms.",
  },
];

export default function TermsOfService() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/settings");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto py-6 px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">Creaverse DAO</p>
            <h1 className="text-2xl font-bold">Terms of Service</h1>
          </div>
        </div>

        <Card className="border-border/60 bg-card">
          <div className="p-6 space-y-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Your trust matters</h2>
                <p className="text-sm text-muted-foreground">
                  Review the commitments and responsibilities that apply when using Creaverse DAO.
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-6">
              {sections.map((section) => (
                <section key={section.title} className="space-y-3">
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                  {section.intro && <p className="text-sm text-muted-foreground">{section.intro}</p>}
                  {section.bullets && (
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                  {section.footer && <p className="text-sm text-muted-foreground">{section.footer}</p>}
                </section>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

