export const LEGAL: Record<string, { title: string; body: [string, string][] }> = {
  privacy: { title: "Privacy policy", body: [
    ["What we collect", "Account details you provide, conversation content processed to deliver the service, and usage data needed to operate and bill."],
    ["How we use it", "To provide HumanOS, keep it secure and support you. We never use customer conversations to train shared models."],
    ["Retention", "Customers set retention windows for transcripts and recordings. Deleted data is removed from active systems within 30 days."],
    ["Your rights", "You can access, correct, export or delete your data by contacting privacy@humanos.ai."],
    ["Sub-processors", "We use carefully selected providers for hosting, real-time media and AI inference, including Anthropic for language models."],
  ] },
  terms: { title: "Terms of service", body: [
    ["Using HumanOS", "You may use the service to build lawful applications that comply with these terms and our acceptable use policy."],
    ["Your content", "You own your content. You grant us the rights needed to operate the service for you."],
    ["Personas & likeness", "You must hold verified consent for any real person's face or voice used to create a persona."],
    ["Billing", "Paid plans are billed monthly in advance; usage above plan limits is billed in arrears."],
    ["Liability", "The service is provided as described in your order form. Our liability is limited as permitted by law."],
  ] },
  "acceptable-use": { title: "Acceptable use policy", body: [
    ["Always disclose", "Personas must not claim to be human. Disclosure is built in and cannot be disabled."],
    ["No impersonation", "Do not create personas of real people without their verified consent."],
    ["No deception or harm", "No fraud, harassment, or content that exploits or endangers anyone, especially minors."],
    ["Consequential decisions", "Do not use HumanOS as the sole basis for employment, credit, housing, healthcare or legal decisions."],
  ] },
};

