
export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto py-20 px-6">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
            <div className="prose prose-lg">
                <p>Last updated: {new Date().toLocaleDateString()}</p>
                <p>
                    At FeedbackPulse, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.
                </p>
                <h3>Information We Collect</h3>
                <p>
                    We collect information you provide directly to us, such as when you create an account, submit feedback, or communicate with us. This may include your name, email address, and project details.
                </p>
                <h3>How We Use Your Information</h3>
                <p>
                    We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to analyze usage patterns.
                </p>
                <h3>Data Security</h3>
                <p>
                    We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
            </div>
        </div>
    );
}
