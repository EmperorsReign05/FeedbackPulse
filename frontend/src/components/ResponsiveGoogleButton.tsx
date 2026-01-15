import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useEffect, useRef, useState } from 'react';

interface ResponsiveGoogleButtonProps {
    onSuccess: (credentialResponse: CredentialResponse) => void;
    onError: () => void;
    text?: 'signin_with' | 'signup_with' | 'continue_with';
}

export default function ResponsiveGoogleButton({
    onSuccess,
    onError,
    text = 'continue_with',
}: ResponsiveGoogleButtonProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState<string>('100%');

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                // Get the computed width of the container
                const newWidth = containerRef.current.offsetWidth;
                // Google button has a max width of 400px and min of 200px
                // We'll pass the exact pixel width as a string
                setWidth(newWidth.toString());
            }
        };

        // Initial measurement
        updateWidth();

        // Add resize listener
        window.addEventListener('resize', updateWidth);

        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    return (
        <div ref={containerRef} className="w-full">
            <GoogleLogin
                onSuccess={onSuccess}
                onError={onError}
                theme="outline"
                size="large"
                width={width}
                text={text}
                shape="rectangular"
            />
        </div>
    );
}
