import { Check, X } from "lucide-react";

const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const requirements = [
    { test: (pw: string) => pw.length >= 8, text: "At least 8 characters" },
    { test: (pw: string) => /[A-Z]/.test(pw), text: "One uppercase letter" },
    { test: (pw: string) => /[a-z]/.test(pw), text: "One lowercase letter" },
    { test: (pw: string) => /\d/.test(pw), text: "One number" },
    {
      test: (pw: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pw),
      text: "One special character",
    },
  ];

  const passedCount = requirements.filter(req => req.test(password)).length;
  const strength = passedCount === 0 ? 0 : (passedCount / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strength < 40) return "bg-red-500";
    if (strength < 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (strength < 40) return "Weak";
    if (strength < 80) return "Medium";
    return "Strong";
  };

  return (
    <div
      className={`mt-2 space-y-2 transition-all duration-200 ease-out transform ${
        password ? "translate-y-0 opacity-100 scale-y-100" : "-translate-y-2 opacity-0 scale-y-0"
      }`}
    >
      {/* Strength bar */}
      {password && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Password strength</span>
            <span
              className={`font-medium ${
                strength < 40
                  ? "text-red-600"
                  : strength < 80
                    ? "text-yellow-600"
                    : "text-green-600"
              }`}
            >
              {getStrengthText()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
              style={{ width: `${strength}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Requirements checklist */}
      {password && (
        <div className="space-y-1">
          {requirements.map((req, index) => {
            const isPassed = req.test(password);
            return (
              <div key={index} className="flex items-center gap-2 text-xs">
                {isPassed ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <X className="w-3 h-3 text-red-500" />
                )}
                <span className={isPassed ? "text-green-600" : "text-red-600"}>{req.text}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
