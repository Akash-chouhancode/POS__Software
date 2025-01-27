import React from 'react';

const ReturnReturn = ({ isOpen, onClose, invoiceDatas }) => {
  if (!isOpen) return null;

  if (!invoiceDatas) {
    return <div>Loading...</div>;
  }

  const {
    supplier_id,
    return_date,
    totalamount,
    totaldiscount,
    return_reason,
    supName,
    items,
  } = invoiceDatas[0].data;
  console.log("bc data aaaa",invoiceDatas[0].data)

  return (
    <div>
      <div className="justify-center flex items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="w-full px-20">
          <div className="py-4 bg-white rounded-md shadow-md border-[1px] border-[#1C1D3E]">
            <div className="flex py-5 px-4 justify-between items-center">
              <h2 className="text-xl font-bold">Return Details</h2>
              <button
                onClick={onClose}
                className="text-white bg-[#FB3F3F] px-2 rounded-md hover:scale-105 font-bold"
              >
                X
              </button>
            </div>
            <div className="p-6  text-center shadow-lg">
              <h3 className="text-lg font-semibold">Supplier: {supName}</h3>
              {/* <p>Return ID: {preturn_id}</p> */}
              <p>Supplier ID: {supplier_id}</p>
              <p>Return Date: {new Date(return_date).toLocaleDateString()}</p>
              <p>Total Amount: {totalamount}</p>
              <p>Total Discount: {totaldiscount}</p>
              <p>Return Reason: {return_reason}</p>

              <h3 className="mt-4 text-lg font-semibold">Items</h3>
              <table className="w-full mt-2 border">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Ingredient Name</th>
                    <th className="border px-4 py-2">Quantity</th>
                    <th className="border px-4 py-2">Product Rate</th>
                    <th className="border px-4 py-2">Discount</th>
                    <th className="border px-4 py-2">UOM</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.product_id}>
                      <td className="border px-4 py-2">{item.ingredient_name}</td>
                      <td className="border px-4 py-2">{item.qty}</td>
                      <td className="border px-4 py-2">{item.product_rate}</td>
                      <td className="border px-4 py-2">{item.discount}</td>
                      <td className="border px-4 py-2">{item.uom_short_code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-55 fixed inset-0 z-40 bg-slate-800"></div>
    </div>
  );
};

export default ReturnReturn;
