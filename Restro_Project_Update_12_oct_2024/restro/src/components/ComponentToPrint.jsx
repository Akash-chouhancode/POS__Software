import React from "react";
export const ComponentToPrint = React.forwardRef((props, ref) => {
  const { cart, total, vat, subtotal, serviceCharge } = props;
  return (
    <div ref={ref}>
      <div className="max-w-lg mx-auto p-4 bg-white border rounded-lg shadow-md">
        <header className="text-center">
          <h1 className="text-2xl font-bold">Restro Uncle</h1>
          <p>
            1st Floor, Plot No , 347, Vijay Nagar Square,
            <br />
            near Krozzon, Scheme 54 PU4, Indore,
            <br />
            Madhya Pradesh 452010
          </p>
        </header>
        <div className="text-center mt-2">
          <p>
            <strong>Date:</strong> {new Date().toLocaleDateString()}
          </p>
        </div>
        <hr className="my-4" />

        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="border-b py-2">Item</th>
              <th className="border-b py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
          {cart.map((item, index) => {
  const itemTotal = item.price * item.quantity;
  const addonsTotal = item.checkedaddons
    ? item.checkedaddons.reduce(
        (sum, addon) =>
          sum + addon.add_on_price * addon.add_on_quantity,
        0
      )
    : 0;
  const grandTotal = itemTotal + addonsTotal + item.productvat;
  
  return (
    <React.Fragment key={index}>
      <tr>
        <td className="py-2">{item.ProductName}</td>
        <td className="py-2 text-right">${itemTotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td className="py-2">
          {item.variantName} <br />
          {item.price} x {item.quantity}
        </td>
        <td className="py-2 text-right"></td>
      </tr>
      {item.checkedaddons &&
  item.checkedaddons.map((addon, aIndex) => (
    <tr key={aIndex}>
      <td className="py-2">{addon.add_on_name}</td>
      <td className="py-2 text-right">
        {typeof addon.add_on_price === 'number' 
          ? `$${addon.add_on_price.toFixed(2)} x ${addon.add_on_quantity}` 
          : 'Invalid price'}
      </td>
    </tr>
  ))}
      <tr className="border-b border-dashed border-2">
        <td></td>
      </tr>
    </React.Fragment>
  );
})}
            <tr className="font-bold">
              <td className="py-2 border-t">Subtotal</td>
              <td className="py-2 text-right border-t">${subtotal}</td>
            </tr>
            <tr className="font-bold">
              <td className="py-2 ">Vat</td>
              <td className="py-2 text-right">${vat}</td>
            </tr>
            <tr className="font-bold">
              <td className="py-2 border-t">Service Charge</td>
              <td className="py-2 text-right border-t">${serviceCharge}</td>
            </tr>
            <tr className="font-bold">
              <td className="py-2 border-t">Total payment</td>
              <td className="py-2 text-right border-t">${total}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
});
