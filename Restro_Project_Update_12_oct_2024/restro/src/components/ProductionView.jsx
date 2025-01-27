import React from 'react'

const ProductionView = ({isOpen, onClose,data}) => {
    if (!isOpen) return null;
  if (!data || data.length === 0) {
    return <div>Loading...</div>;
  }
   const fooddetails =data.data.fooddetails;
  const itemdetails =data.data.itemdetails;
  const totalPriceSum =data.data.totalPriceSum;

  console.log("object",data)
  return (
    <div>
      <div className="justify-center flex items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none ">
        <div className=" w-full  px-20 ">
          <div className=" py-4  bg-white  rounded-md shadow-md border-[1px] border-[#1C1D3E]">
            <div className="flex  py-5 px-4 justify-between items-center ">
              {/* <button className="text-white bg-[#4CBBA1] px-2  py-2  rounded-md  hover:scale-105 font-bold">
                print
              </button> */}
              <span></span>
              <button
                onClick={onClose}
                className="text-white bg-[#FB3F3F] px-2  rounded-md hover:scale-105 font-bold"
              >
                X
              </button>
            </div>
            <div className="">
  <div className="w-full bg-white p-6">
  <div className="p-6 bg-gray-50 rounded shadow-lg">
      {/* Food Details */}
      <h2 className="text-xl font-semibold mb-4">Food Details</h2>
      <table className="w-full bg-white rounded border">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Food Name</th>
            <th className="px-4 py-2 border">Variant Name</th>
          </tr>
        </thead>
        <tbody>
          {fooddetails.map((food, index) => (
            <tr key={index} className="text-center">
              <td className="px-4 py-2 border">{food.foodName}</td>
              <td className="px-4 py-2 border">{food.variantName}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Ingredient Details */}
      <h2 className="text-xl font-semibold mt-6 mb-4">Ingredient Details</h2>
      <table className="w-full bg-white rounded border">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Ingredient Name</th>
            <th className="px-4 py-2 border">Quantity</th>
            <th className="px-4 py-2 border">Price</th>
            <th className="px-4 py-2 border">Total Price</th>
          </tr>
        </thead>
        <tbody>
          {itemdetails.map((item, index) => (
            <tr key={index} className="text-center">
              <td className="px-4 py-2 border">{item.ingredient_name}</td>
              <td className="px-4 py-2 border">{item.productionDetailqty}</td>
              <td className="px-4 py-2 border">₹{item.price}</td>
              <td className="px-4 py-2 border">₹{item.totalPriceofproductioningredient}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="mt-6 text-right font-semibold">
        <p>Total Price Sum: ₹{totalPriceSum}</p>
      </div>
    </div>
  </div>
</div>
          </div>
        </div>
      </div>
      <div className=" opacity-55 fixed inset-0 z-40 bg-slate-800"></div>
    </div>
  )
}

export default ProductionView
