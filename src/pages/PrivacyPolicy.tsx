import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Section = {
  title: string;
  intro?: string;
  bullets?: string[];
  footer?: string;
};

const sections: Section[] = [
  {
    title: "1.1 Information You Provide",
    intro: "We may collect:",
    bullets: [
      "Name, username, email address",
      "Profile information (bio, creator type, content category)",
      "Messages and communications within the platform",
      "Content you upload (posts, reviews, media, metadata)",
      "Support requests and feedback",
    ],
  },
  {
    title: "1.2 Wallet & Blockchain Data",
    intro: "When you connect a wallet:",
    bullets: [
      "Public wallet address",
      "On-chain transaction hashes",
      "Token balances and NFT ownership (public blockchain data)",
      "⚠️ We do NOT collect or store private keys or seed phrases.",
    ],
  },
  {
    title: "1.3 Automatically Collected Information",
    intro: "We automatically collect:",
    bullets: [
      "IP address",
      "Device type, browser, OS",
      "App usage data (pages viewed, actions taken)",
      "Cookies and similar technologies",
    ],
  },
  {
    title: "2. How We Use Your Information",
    intro: "We use your information to:",
    bullets: [
      "Operate and improve the Platform",
      "Enable messaging, posting, and social features",
      "Power AI-based recommendations and moderation",
      "Facilitate DAO governance and voting",
      "Distribute rewards and tokens",
      "Prevent fraud, abuse, and security threats",
      "Comply with legal obligations",
    ],
  },
  {
    title: "3. AI & Automated Processing",
    intro: "Creaverse DAO uses AI systems for:",
    bullets: [
      "Content ranking and feed algorithms",
      "Review quality analysis",
      "Spam and abuse detection",
      "Creator insights and analytics",
    ],
    footer:
      "AI decisions are assistive, not fully autonomous, and may involve human review.",
  },
  {
    title: "4. Cookies & Tracking Technologies",
    intro: "We use cookies to:",
    bullets: [
      "Maintain login sessions",
      "Improve user experience",
      "Analyze platform performance",
    ],
    footer: "Disabling cookies may limit some functionality.",
  },
  {
    title: "5. How We Share Information",
    intro: "We do not sell your personal data. We may share data with:",
    bullets: [
      "Infrastructure providers (hosting, analytics, security)",
      "Blockchain networks (public transaction data)",
      "Legal authorities if required by law",
      "DAO governance processes (anonymized or public on-chain data)",
    ],
    footer: "All third parties are required to maintain appropriate security standards.",
  },
  {
    title: "6. Web3 & Blockchain Transparency",
    intro: "You acknowledge:",
    bullets: [
      "Blockchain data is public and immutable",
      "Transactions cannot be deleted or altered",
      "Wallet addresses may be traceable",
      "Creaverse DAO cannot modify or erase on-chain data.",
    ],
  },
  {
    title: "7. Data Retention",
    intro: "We retain personal data:",
    bullets: [
      "As long as your account is active",
      "As needed for legal, security, or operational purposes",
      "Some data (especially on-chain data) cannot be removed even if you request deletion.",
    ],
  },
  {
    title: "8. Data Security",
    intro: "We use:",
    bullets: [
      "Encryption",
      "Secure servers",
      "Access controls",
      "Regular security audits",
    ],
    footer: "No system is 100% secure. Use the Platform at your own risk.",
  },
  {
    title: "9. Your Rights",
    intro: "Depending on your jurisdiction, you may have the right to:",
    bullets: [
      "Access your personal data",
      "Correct inaccurate information",
      "Request deletion of your account",
      "Withdraw consent (where applicable)",
      "Object to certain processing activities",
    ],
    footer: "Requests can be sent to our support email.",
  },
  {
    title: "10. Children’s Privacy",
    intro: "Creaverse DAO is not intended for users under 18.",
    footer: "We do not knowingly collect data from minors.",
  },
  {
    title: "11. International Data Transfers",
    intro:
      "Your data may be processed in different countries depending on infrastructure providers. We ensure reasonable safeguards for international transfers.",
  },
  {
    title: "12. Third-Party Links & Services",
    intro:
      "The Platform may contain links to third-party services (wallets, marketplaces, block explorers). We are not responsible for their privacy practices.",
  },
  {
    title: "13. Changes to This Policy",
    intro:
      "We may update this Privacy Policy from time to time. Continued use of the Platform means you accept the updated policy.",
  },
];

export default function PrivacyPolicy() {
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
            <h1 className="text-2xl font-bold">Privacy Policy</h1>
          </div>
        </div>

        <Card className="border-border/60 bg-card">
          <div className="p-6 space-y-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Understand how we handle data</h2>
                <p className="text-sm text-muted-foreground">
                  Review what we collect, how we use it, and your rights when using Creaverse DAO.
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

