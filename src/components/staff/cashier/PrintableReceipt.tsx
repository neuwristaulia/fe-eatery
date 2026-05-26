import * as React from "react";
import { StaffOrder } from "@/store/useStaffStore";

interface PrintableReceiptProps {
  order: StaffOrder;
  cashierName: string;
}

export const PrintableReceipt = React.forwardRef<HTMLDivElement, PrintableReceiptProps>(
  ({ order, cashierName }, ref) => {
    // Gunakan tanggal sesuai data order jika ada, jika tidak pakai sekarang
    const today = new Date();
    const dateStr = today.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    // Jika order ada time bawaan, kita gabungkan
    const timeStr = order.time || today.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div ref={ref} className="print-section font-mono text-black bg-white p-4 max-w-[80mm] mx-auto text-sm">
        {/* Header */}
        <div className="text-center mb-6">
          {/* Anda bisa ganti logo image jika ada: <img src="/logo.png" className="mx-auto w-12 h-12 mb-2" /> */}
          <h1 className="font-bold text-xl mb-1">e-Eatery</h1>
          <p className="text-xs">Jl. Sudirman No. 123, Jakarta</p>
          <p className="text-xs">Telp: 0812-3456-7890</p>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-black my-2"></div>

        {/* Info */}
        <div className="text-xs mb-2">
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{dateStr} {timeStr}</span>
          </div>
          <div className="flex justify-between">
            <span>Order ID:</span>
            <span>{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Cashier:</span>
            <span>{cashierName}</span>
          </div>
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="uppercase">
              {order.type} {order.tableNumber ? `(T-${order.tableNumber})` : ""}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-black my-2"></div>

        {/* Items */}
        <div className="text-xs my-2 space-y-2">
          {order.items.map((item, i) => (
            <div key={i}>
              <div className="font-bold">{item.name}</div>
              <div className="flex justify-between">
                <span>
                  {item.qty} x Rp {item.price.toLocaleString("id-ID")}
                </span>
                <span>Rp {(item.qty * item.price).toLocaleString("id-ID")}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-black my-2"></div>

        {/* Totals */}
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rp {order.subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax & Service</span>
            <span>Rp {order.tax.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between font-bold text-sm mt-1 pt-1 border-t border-dashed border-black">
            <span>TOTAL</span>
            <span>Rp {order.total.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Payment Method</span>
            <span className="uppercase">{order.paymentMethod || "-"}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-black my-2"></div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs">
          <p className="font-bold mb-1">Terima Kasih!</p>
          <p>Silakan datang kembali</p>
          <p className="mt-4">Wifi: e-Eatery_Guest / Pass: eeatery</p>
        </div>
      </div>
    );
  }
);
PrintableReceipt.displayName = "PrintableReceipt";
