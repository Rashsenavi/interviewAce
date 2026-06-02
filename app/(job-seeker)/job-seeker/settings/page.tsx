"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Lock,
  CreditCard,
  Globe,
  Loader2,
  Trash2,
  Plus,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useToast } from "@/lib/context/ToastContext";
import { jobSeekerApi, authApi } from "@/lib/api";

const settingsSections = [
  { id: "profile", name: "Profile Settings", icon: User },
  { id: "security", name: "Security", icon: Lock },
  { id: "payments", name: "Payment Methods", icon: CreditCard },
  { id: "preferences", name: "Preferences", icon: Globe },
];

interface CreditCardInfo {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
  cardholderName: string;
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [activeSection, setActiveSection] = useState("profile");

  // --- Profile State ---
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // --- Security State ---
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  // --- Payments State ---
  const [cards, setCards] = useState<CreditCardInfo[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardExpiry, setNewCardExpiry] = useState("");
  const [newCardCvv, setNewCardCvv] = useState("");
  const [newCardName, setNewCardName] = useState("");
  const [newCardBrand, setNewCardBrand] = useState("VISA");

  // --- Preferences State ---
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("Asia/Colombo (GMT+5:30)");

  // --- Load Profile Data ---
  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await jobSeekerApi.getProfile();
        if (response.success && response.data?.profile) {
          const p = response.data.profile;
          setFirstName(p.firstName || "");
          setLastName(p.lastName || "");
          setPhoneNumber(p.phoneNumber || "");
          setEmail(p.email || "");
          if (p.preferredLanguage) {
            // Capitalize language name
            const lang = p.preferredLanguage.charAt(0).toUpperCase() + p.preferredLanguage.slice(1);
            setLanguage(lang);
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        toast.error("Could not load profile data.");
      } finally {
        setIsLoadingProfile(false);
      }
    }
    loadProfile();
  }, [toast]);

  // --- Load LocalStorage Settings ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Preferences
      setTimezone(localStorage.getItem("settings_timezone") || "Asia/Colombo (GMT+5:30)");

      // Cards
      const storedCards = localStorage.getItem("settings_cards");
      if (storedCards) {
        setCards(JSON.parse(storedCards));
      } else {
        const defaultCards = [
          {
            id: "1",
            brand: "VISA",
            last4: "4242",
            expiry: "12/27",
            isDefault: true,
            cardholderName: "Rusini Chamathka",
          },
        ];
        setCards(defaultCards);
        localStorage.setItem("settings_cards", JSON.stringify(defaultCards));
      }
    }
  }, []);

  // --- Save Profile ---
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);

    try {
      const response = await jobSeekerApi.updateProfile({
        firstName,
        lastName,
        phoneNumber,
        preferredLanguage: language.toLowerCase(),
      });

      if (response.success && response.data?.profile) {
        // Sync with auth context so header updates instantly
        if (user) {
          updateUser({
            ...user,
            firstName,
            lastName,
            phoneNumber,
          });
        }
        toast.success("Profile updated successfully!");
      } else {
        toast.error(response.error?.message || "Failed to update profile.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- Save Security Real ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsSavingSecurity(true);
    try {
      const response = await authApi.changePassword(currentPassword, newPassword);
      if (response.success) {
        toast.success("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowChangePassword(false);
      } else {
        toast.error(response.error?.message || "Failed to update password.");
      }
    } catch (err) {
      toast.error("An error occurred while updating the password.");
    } finally {
      setIsSavingSecurity(false);
    }
  };

  // --- Card Operations ---
  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber || !newCardExpiry || !newCardCvv || !newCardName) {
      return;
    }

    const last4 = newCardNumber.replace(/\s+/g, "").slice(-4);
    const newCard: CreditCardInfo = {
      id: Date.now().toString(),
      brand: newCardBrand,
      last4: last4 || "1111",
      expiry: newCardExpiry,
      isDefault: cards.length === 0,
      cardholderName: newCardName,
    };

    const updatedCards = [...cards, newCard];
    setCards(updatedCards);
    localStorage.setItem("settings_cards", JSON.stringify(updatedCards));

    // Clear form
    setNewCardNumber("");
    setNewCardExpiry("");
    setNewCardCvv("");
    setNewCardName("");
    setShowAddCard(false);
    toast.success("Payment method added successfully!");
  };

  const handleSetDefaultCard = (id: string) => {
    const updatedCards = cards.map((c) => ({
      ...c,
      isDefault: c.id === id,
    }));
    setCards(updatedCards);
    localStorage.setItem("settings_cards", JSON.stringify(updatedCards));
    toast.success("Default payment method updated.");
  };

  const handleDeleteCard = (id: string) => {
    const updatedCards = cards.filter((c) => c.id !== id);
    // If we deleted the default card, set the first remaining card as default
    if (updatedCards.length > 0 && !updatedCards.some((c) => c.isDefault)) {
      updatedCards[0].isDefault = true;
    }
    setCards(updatedCards);
    localStorage.setItem("settings_cards", JSON.stringify(updatedCards));
    toast.success("Payment method removed.");
  };

  // --- Preferences Toggles ---
  const handleLanguageChange = async (val: string) => {
    setLanguage(val);
    toast.success("Preference language updated.");

    // Sync with database profile
    try {
      await jobSeekerApi.updateProfile({
        preferredLanguage: val.toLowerCase(),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleTimezoneChange = (val: string) => {
    setTimezone(val);
    localStorage.setItem("settings_timezone", val);
    toast.success("Preference timezone updated.");
  };

  return (
    <div className="max-w-4xl">
      <div className="flex gap-6 mt-2">
        {/* Sidebar */}
        <div className="w-64 bg-white rounded-2xl border border-slate-100 p-4 h-fit shadow-xs">
          <nav className="space-y-1">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeSection === section.id
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <section.icon className="w-5 h-5 flex-shrink-0" />
                {section.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Panel */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
          {/* PROFILE SECTION */}
          {activeSection === "profile" && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-5">Profile Settings</h2>
              
              {isLoadingProfile ? (
                <div className="flex flex-col items-center py-8">
                  <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
                  <p className="text-sm text-slate-500 mt-2">Loading profile details...</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm text-slate-950 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm text-slate-950 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-400 font-medium cursor-not-allowed"
                    />
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">
                      Your login email address cannot be changed.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm text-slate-950 font-medium"
                    />
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="w-fit flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* NOTIFICATIONS SECTION REMOVED */}

          {/* SECURITY SECTION */}
          {activeSection === "security" && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-5">Security Settings</h2>

              <div className="space-y-4">
                {/* Change Password Block */}
                {!showChangePassword ? (
                  <button
                    onClick={() => {
                      setShowChangePassword(true);
                    }}
                    className="w-full text-left p-4 border border-slate-100 rounded-xl hover:bg-slate-50/50 transition-all duration-200"
                  >
                    <p className="font-bold text-slate-900 text-sm">Change Password</p>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                      Update your account password
                    </p>
                  </button>
                ) : (
                  <form onSubmit={handleChangePassword} className="border border-slate-100 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">Change Password</h3>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isSavingSecurity}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {isSavingSecurity && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Save Password
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowChangePassword(false)}
                        className="rounded-xl border border-slate-200 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

              </div>
            </div>
          )}

          {/* PAYMENTS SECTION */}
          {activeSection === "payments" && (
            <div>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-slate-900">Payment Methods</h2>
                {!showAddCard && (
                  <button
                    onClick={() => setShowAddCard(true)}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/50 px-3.5 py-2 rounded-xl transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Card
                  </button>
                )}
              </div>

              {/* Payment success alerts handled by Toast */}

              {/* Add Card Form */}
              {showAddCard && (
                <form onSubmit={handleAddCard} className="border border-slate-100 rounded-xl p-5 mb-5 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Add Payment Method</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Card Brand
                      </label>
                      <select
                        value={newCardBrand}
                        onChange={(e) => setNewCardBrand(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm"
                      >
                        <option value="VISA">VISA</option>
                        <option value="MASTERCARD">MASTERCARD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={newCardName}
                        onChange={(e) => setNewCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      maxLength={19}
                      value={newCardNumber}
                      onChange={(e) => setNewCardNumber(e.target.value)}
                      placeholder="•••• •••• •••• ••••"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm font-medium"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        value={newCardExpiry}
                        onChange={(e) => setNewCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        maxLength={3}
                        value={newCardCvv}
                        onChange={(e) => setNewCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-indigo-700"
                    >
                      Save Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddCard(false)}
                      className="rounded-xl border border-slate-200 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Cards List */}
              <div className="space-y-4">
                {cards.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6 font-medium">
                    No payment methods added.
                  </p>
                ) : (
                  cards.map((card) => (
                    <div
                      key={card.id}
                      className="p-4 border border-slate-100 rounded-xl flex items-center justify-between bg-slate-50/20"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-8 rounded flex items-center justify-center text-[10px] font-black text-white ${
                            card.brand === "VISA" ? "bg-blue-600" : "bg-orange-500"
                          }`}
                        >
                          {card.brand}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">•••• {card.last4}</p>
                          <p className="text-xs text-slate-400 mt-0.5 font-semibold">
                            Expires {card.expiry} | {card.cardholderName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {card.isDefault ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                            Default
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetDefaultCard(card.id)}
                            className="text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 transition"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Remove card"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* PREFERENCES SECTION */}
          {activeSection === "preferences" && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-5">Preferences</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Preferred Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm font-semibold text-slate-900"
                  >
                    <option value="English">English</option>
                    <option value="Sinhala">Sinhala</option>
                    <option value="Tamil">Tamil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => handleTimezoneChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm font-semibold text-slate-900"
                  >
                    <option value="Asia/Colombo (GMT+5:30)">Asia/Colombo (GMT+5:30)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
