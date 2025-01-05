import { X } from "lucide-react";
import { useEffect, useState } from "react";

const NewTabDialog = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [enableNewTab, setEnableNewTab] = useState(false);

  useEffect(() => {
    // 从 storage 中读取设置
    browser.storage.local.get("enableNewTab").then((result) => {
      setEnableNewTab(result.enableNewTab ?? true);
    });
  }, []);

  const handleNewTabChange = async (checked: boolean) => {
    setEnableNewTab(checked);
    await browser.storage.local.set({ enableNewTab: checked });
    // 重新加载扩展以应用更改
    await browser.runtime.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-[90%] max-w-md rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-medium">新标签页设置</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-sm font-medium">启用新标签页替换</h3>
              <p className="text-sm text-gray-500">
                开启后将使用Readecho作为新标签页
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={enableNewTab}
                onChange={(e) => handleNewTabChange(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTabDialog;
