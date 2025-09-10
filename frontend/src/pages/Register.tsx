import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "./Auth.css";

export default function Register() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const validatePassword = (pwd: string): string[] => {
    const rules: string[] = [];
    if (pwd.length < 8) rules.push("At least 8 characters");
    if (!/[a-z]/.test(pwd)) rules.push("At least 1 lowercase letter");
    if (!/[A-Z]/.test(pwd)) rules.push("At least 1 uppercase letter");
    if (!/[0-9]/.test(pwd)) rules.push("At least 1 digit");
    if (!/[@$!%*?&]/.test(pwd)) rules.push("At least 1 special character (@$!%*?&)");
    return rules;
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    setErrors(validatePassword(val));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (errors.length > 0) {
      toast.error("Password does not meet the requirements");
      return;
    }
    try {
      await register(email, password);
      toast.success("Registration successful!");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={submit}>
        <h2>Register</h2>

        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
          />
        </label>

        <label>
          Confirm Password
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>

        {errors.length > 0 && (
          <ul className="password-errors">
            {errors.map((err, idx) => (
              <li key={idx} style={{ color: "red", fontSize: "0.9rem" }}>
                {err}
              </li>
            ))}
          </ul>
        )}

        <button type="submit">Register</button>
      </form>
    </div>
  );
}
