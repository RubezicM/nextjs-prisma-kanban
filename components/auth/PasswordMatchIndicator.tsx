import { Check, X } from "lucide-react";

type PasswordMatchIndicatorProps = {
  password: string;
  confirmPassword: string;
};

const PasswordMatchIndicator = ({ password, confirmPassword }: PasswordMatchIndicatorProps) => {
  if (!confirmPassword) return null;

  const isMatch = password === confirmPassword;

  return (
    <div className="flex items-center gap-2 mt-1 text-xs">
      {isMatch ? (
        <>
          <Check className="w-3 h-3 text-green-500" />
          <span className="text-green-600">Passwords match</span>
        </>
      ) : (
        <>
          <X className="w-3 h-3 text-red-500" />
          <span className="text-red-600">Passwords don&apos;t match</span>
        </>
      )}
    </div>
  );
};

export default PasswordMatchIndicator;
