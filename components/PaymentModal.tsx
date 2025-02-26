interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: string;
  buttonText: string;
  onConfirm: () => void;
}

const PaymentModal = ({
  open,
  onClose,
  title,
  content,
  buttonText,
  onConfirm,
}: PaymentModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
          <p className="text-sm text-gray-500 mb-6">{content}</p>

          <div className="flex space-x-3 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              取消
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm text-white bg-gradient-to-r from-orange-500 to-orange-400 hover:opacity-90 rounded-md transition-opacity"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
