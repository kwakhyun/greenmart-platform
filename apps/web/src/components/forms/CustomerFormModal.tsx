"use client";

import { useState } from "react";
import { Modal } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { useCreateMember } from "@/hooks";
import { Loader2 } from "lucide-react";

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GRADE_OPTIONS = [
  { value: "BRONZE", label: "브론즈" },
  { value: "SILVER", label: "실버" },
  { value: "GOLD", label: "골드" },
  { value: "PLATINUM", label: "플래티넘" },
] as const;

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "활성" },
  { value: "DORMANT", label: "휴면" },
  { value: "WITHDRAWN", label: "탈퇴" },
] as const;

const CHANNEL_OPTIONS = [
  { value: "ONLINE", label: "온라인" },
  { value: "OFFLINE", label: "오프라인" },
  { value: "APP", label: "앱" },
  { value: "GLOBAL", label: "글로벌" },
] as const;

export function CustomerFormModal({ isOpen, onClose }: CustomerFormModalProps) {
  const createMember = useCreateMember();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    grade: "BRONZE" as string,
    status: "ACTIVE" as string,
    joinChannel: "ONLINE" as string,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (form.name.length < 2) newErrors.name = "이름은 2자 이상이어야 합니다";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "올바른 이메일 형식이어야 합니다";
    if (!/^01[0-9]-\d{3,4}-\d{4}$/.test(form.phone))
      newErrors.phone = "올바른 전화번호 형식이어야 합니다 (01x-xxxx-xxxx)";
    if (!form.joinChannel) newErrors.joinChannel = "가입 채널을 선택해주세요";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createMember.mutateAsync({
        name: form.name,
        email: form.email,
        phone: form.phone,
        grade: form.grade as "BRONZE" | "SILVER" | "GOLD" | "PLATINUM",
        status: form.status as "ACTIVE" | "DORMANT" | "WITHDRAWN",
        joinChannel: form.joinChannel as
          | "ONLINE"
          | "OFFLINE"
          | "APP"
          | "GLOBAL",
      });
      toast("success", "회원이 등록되었습니다.");
      onClose();
      setForm({
        name: "",
        email: "",
        phone: "",
        grade: "BRONZE",
        status: "ACTIVE",
        joinChannel: "ONLINE",
      });
    } catch {
      toast("error", "회원 등록에 실패했습니다.");
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="회원 등록"
      description="새 회원을 등록합니다."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 이름 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이름 <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="input-field w-full"
            placeholder="이름을 입력하세요"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* 이메일 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이메일 <span className="text-red-500">*</span>
          </label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="input-field w-full"
            placeholder="example@email.com"
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        {/* 전화번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            전화번호 <span className="text-red-500">*</span>
          </label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="input-field w-full"
            placeholder="010-1234-5678"
          />
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>

        {/* 등급 / 상태 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              등급
            </label>
            <select
              name="grade"
              value={form.grade}
              onChange={handleChange}
              className="input-field w-full"
            >
              {GRADE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상태
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="input-field w-full"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 가입 채널 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            가입 채널 <span className="text-red-500">*</span>
          </label>
          <select
            name="joinChannel"
            value={form.joinChannel}
            onChange={handleChange}
            className="input-field w-full"
          >
            {CHANNEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 액션 */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button type="button" onClick={onClose} className="btn-secondary">
            취소
          </button>
          <button
            type="submit"
            disabled={createMember.isPending}
            className="btn-primary disabled:opacity-50"
          >
            {createMember.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> 등록 중...
              </>
            ) : (
              "회원 등록"
            )}
          </button>
        </div>

        {createMember.isError && (
          <p className="text-xs text-red-500 text-center">
            등록에 실패했습니다. 입력값을 확인해주세요.
          </p>
        )}
      </form>
    </Modal>
  );
}
