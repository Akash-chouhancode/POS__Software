const express = require("express");
const router = express.Router();

const ingredientsController = require("../controllers/ingredientController");

// Create a new ingredient
router.post("/ingredients", ingredientsController.createIngredient);
// router.put("/ingredients/:id", ingredientsController.updateIngredient);

// Delete an existing ingredient
router.delete("/ingredients/:id", ingredientsController.deleteIngredient);

// Get all ingredients
router.get("/ingredients", ingredientsController.getAllIngredients);
router.get('/ingredients/:id', ingredientsController.getIngredientById);
router.put('/ingredients/:id', ingredientsController.updateIngredient);
// get ingredient list accourding t stock

router.get('/ingredientsdetail',ingredientsController.getIngredientsDetails);
module.exports = router;
