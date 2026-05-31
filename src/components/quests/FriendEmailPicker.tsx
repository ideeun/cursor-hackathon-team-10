"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, UserPlus, X } from "lucide-react";
import {
  isValidEmail,
  searchUsersByEmailPrefix,
  type UserSearchResult,
} from "@/lib/users-search";

export interface FriendEntry {
  email: string;
  name?: string;
}

const EMPTY_FRIENDS: FriendEntry[] = [];

interface FriendEmailPickerProps {
  currentUid: string;
  addedFriends?: FriendEntry[];
  onAdd: (friend: FriendEntry) => void | Promise<void>;
  onRemove?: (email: string) => void;
  placeholder?: string;
}

export default function FriendEmailPicker({
  currentUid,
  addedFriends = EMPTY_FRIENDS,
  onAdd,
  onRemove,
  placeholder = "Начните вводить email друга...",
}: FriendEmailPickerProps) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [adding, setAdding] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const addedEmailsKey = useMemo(
    () => addedFriends.map((f) => f.email.toLowerCase()).sort().join("\0"),
    [addedFriends]
  );

  const addedEmails = useMemo(
    () => new Set(addedEmailsKey ? addedEmailsKey.split("\0") : []),
    [addedEmailsKey]
  );

  useEffect(() => {
    if (input.trim().length < 2) {
      setSuggestions((prev) => (prev.length === 0 ? prev : []));
      setSearching((prev) => (prev ? false : prev));
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchUsersByEmailPrefix(input, currentUid);
        const filtered = results.filter(
          (r) => !addedEmails.has(r.email.toLowerCase())
        );
        setSuggestions(filtered);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [input, currentUid, addedEmailsKey, addedEmails]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addFriend = useCallback(
    async (email: string, name?: string) => {
      const normalized = email.trim().toLowerCase();
      if (!normalized) return;
      if (addedEmails.has(normalized)) {
        setInputError("Этот друг уже добавлен");
        return;
      }
      if (!isValidEmail(normalized)) {
        setInputError("Введите корректный email");
        return;
      }

      setInputError(null);
      setAdding(true);
      try {
        await onAdd({ email: normalized, name });
        setInput("");
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setAdding(false);
      }
    },
    [addedEmails, onAdd]
  );

  const handleSelectSuggestion = (user: UserSearchResult) => {
    void addFriend(user.email, user.name);
  };

  const handleAddClick = () => {
    void addFriend(input);
  };

  return (
    <div className="space-y-2">
      <div ref={wrapperRef} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="email"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setInputError(null);
                if (e.target.value.trim().length >= 2) {
                  setShowSuggestions(true);
                }
              }}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (suggestions.length > 0 && showSuggestions) {
                    handleSelectSuggestion(suggestions[0]);
                  } else {
                    handleAddClick();
                  }
                }
              }}
              placeholder={placeholder}
              className="w-full rounded-xl border border-sand bg-white px-3 py-2.5 pr-8 text-sm text-ink outline-none focus:border-peach-muted"
            />
            {searching && (
              <Loader2
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-ink-faint"
              />
            )}
          </div>
          <button
            type="button"
            onClick={handleAddClick}
            disabled={adding || !input.trim()}
            className="sf-btn-soft flex shrink-0 items-center gap-1 px-3 py-2 text-xs disabled:opacity-50"
          >
            {adding ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <UserPlus size={14} />
            )}
            Добавить
          </button>
        </div>

        {showSuggestions && input.trim().length >= 2 && (
          <ul className="absolute z-20 mt-1 max-h-44 w-full overflow-y-auto rounded-xl border border-sand bg-white py-1 shadow-lg">
            {searching && suggestions.length === 0 && (
              <li className="px-3 py-2 text-xs text-ink-faint">Поиск...</li>
            )}
            {!searching && suggestions.length === 0 && (
              <li className="px-3 py-2 text-xs text-ink-faint">
                Нет пользователей — друг должен зарегистрироваться
              </li>
            )}
            {suggestions.map((user) => (
              <li key={user.uid}>
                <button
                  type="button"
                  onClick={() => handleSelectSuggestion(user)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-peach-soft/60"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-peach-soft text-xs font-semibold text-peach-deep">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {user.name}
                    </span>
                    <span className="block truncate text-xs text-ink-light">
                      {user.email}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {inputError && (
        <p className="text-xs text-red-600">{inputError}</p>
      )}

      {addedFriends.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {addedFriends.map((friend) => (
            <li
              key={friend.email}
              className="inline-flex items-center gap-1.5 rounded-full bg-peach-soft px-3 py-1 text-xs text-peach-deep"
            >
              <span className="max-w-[180px] truncate">
                {friend.name ? `${friend.name} · ` : ""}
                {friend.email}
              </span>
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(friend.email)}
                  className="rounded-full p-0.5 hover:bg-peach-muted/20"
                  aria-label="Удалить"
                >
                  <X size={12} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
