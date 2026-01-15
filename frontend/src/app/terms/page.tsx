
export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto py-20 px-6">
            <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
            <div className="prose prose-lg">
                <p>Last updated: {new Date().toLocaleDateString()}</p>
                <p>
                    Please read these Terms of Service ("Terms") carefully before using FeedbackPulse. By accessing or using our service, you agree to be bound by these Terms.
                </p>
                <h3>Use of Service</h3>
                <p>
                    You may use our service only for lawful purposes and in accordance with these Terms. You are responsible for maintaining the confidentiality of your account credentials.
                </p>
                <h3>Intellectual Property</h3>
                <p>
                    The service and its original content, features, and functionality are and will remain the exclusive property of FeedbackPulse and its licensors.
                </p>
                <h3>Termination</h3>
                <p>
                    We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>
            </div>
        </div>
    );
}
