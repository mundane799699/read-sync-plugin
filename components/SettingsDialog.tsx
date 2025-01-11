import React from 'react';
import { X } from "lucide-react";
import MembershipDialog from "./MembershipDialog";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentBackgroundIndex: number;
  setCurrentBackgroundIndex: (index: number) => void;
  showClock: boolean;
  setShowClock: (show: boolean) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  currentBackgroundIndex,
  setCurrentBackgroundIndex,
  showClock,
  setShowClock,
}) => {
  const [selectedBook, setSelectedBook] = React.useState("全部笔记");
  const [reviewCount, setReviewCount] = React.useState("5");
  const [showMembership, setShowMembership] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-medium text-gray-900 mb-6">设置</h2>

        <div className="space-y-6">
          {/* 背景设置 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">背景</span>
            <button
              onClick={() => setCurrentBackgroundIndex(currentBackgroundIndex + 1)}
              className="bg-gray-200 hover:bg-gray-300 rounded-lg px-4 py-2 transition-colors"
            >
              切换背景
            </button>
          </div>

          {/* 时钟设置 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">显示时钟</span>
            <button
              onClick={() => setShowClock(!showClock)}
              className={`${
                showClock ? 'bg-[#FF725F]' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
            >
              <span className="sr-only">显示时钟</span>
              <span
                className={`${
                  showClock ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </button>
          </div>

          {/* 其他设置 */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              每次回顾数量
            </label>
            <select
              value={reviewCount}
              onChange={(e) => setReviewCount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="5">5条</option>
              <option value="10">10条</option>
              <option value="15">15条</option>
              <option value="20">20条</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              选择书籍
            </label>
            <select
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="全部笔记">全部笔记</option>
              <option value="最近阅读">最近阅读</option>
            </select>
          </div>

          {/* Pro Button */}
          <button
            onClick={() => setShowMembership(true)}
            className="w-full bg-gradient-to-r from-[#FF725F] to-[#FF8D6B] text-white rounded-lg py-2 hover:opacity-90 transition-opacity"
          >
            升级 Pro
          </button>
        </div>
      </div>

      <MembershipDialog
        isOpen={showMembership}
        onClose={() => setShowMembership(false)}
      />
    </div>
import { X } from "lucide-react";
import MembershipDialog from "./MembershipDialog";

const SettingsDialog = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [selectedBook, setSelectedBook] = useState("全部笔记");
  const [reviewCount, setReviewCount] = useState("5");
  const [email, setEmail] = useState("user@example.com");
  const [showMembership, setShowMembership] = useState(false);

  if (!isOpen) return null;

  const reviewOptions = [
    { value: "5", label: "5条/天" },
    { value: "10", label: "10条/天" },
    { value: "20", label: "20条/天" },
  ];

  const handleSave = () => {
    // TODO: Save settings
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative w-[90%] max-w-md rounded-lg bg-white shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-medium">邮箱回顾（Beta）</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6 p-6">
            {/* Review Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">回顾范围</label>
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="w-full rounded-md border bg-white px-3 py-2"
              >
                <option value="全部笔记">全部笔记</option>
                <option value="少有人走的路">少有人走的路</option>
                <option value="认知觉醒">认知觉醒</option>
              </select>
            </div>

            {/* Review Count */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">回顾数量</label>
              <select
                value={reviewCount}
                onChange={(e) => setReviewCount(e.target.value)}
                className="w-full rounded-md border bg-white px-3 py-2"
              >
                {reviewOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Email Settings */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱地址"
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            {/* Pro Button */}
            <button
              onClick={() => setShowMembership(true)}
              className="w-full rounded-md bg-[#ff6b24] py-3 font-medium text-white transition hover:bg-[#ff6b24]/90"
            >
              8￥开通会员立享邮箱回顾
            </button>

            {/* Description */}
            <p className="text-center text-sm text-gray-500">
              因为邮箱发送需要服务器成本，故收取成本费用，后续为会员用户提供更多服务，感谢支持
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 border-t p-4">
            <button
              onClick={onClose}
              className="rounded-md px-4 py-2 text-gray-600 transition hover:bg-gray-100"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="rounded-md bg-[#14161a] px-4 py-2 text-white transition hover:bg-[#14161a]/90"
            >
              保存
            </button>
          </div>
        </div>
      </div>

      <MembershipDialog
        isOpen={showMembership}
        onClose={() => setShowMembership(false)}
      />
    </>
  );
};

export default SettingsDialog;
