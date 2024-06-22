## Core Features
* Household System
  * Multiple users can be part of any given household
  * A single user can be part of multiple households (e.g. a child whose parents live in separate households)
    * Scheduling system to automatically show meal plans as though it were a single household
    * Hide multi-household selection dropdowns and other UI elements when a user is only part of one household
  * Each user has their own account
  * Each user can have their own preferences
  * Each user can track liked and disliked means by rating it on a scale from 1–10
    * This should be taken into account when ranking meals
  * Each user can have their own allergies & dietary restrictions
  * Recipes and meal plans are shared with the entire household
    * Users may enter user-specific meal plans but they are still shared with the household
  * QR code to join a household
    * Set an expiration date that defaults to 48 hours
* Recipe Tracking
  * Allow for optional ingredients
  * Allow a note for each ingredient
  * Allow multiple "styles" of a recipe
  * Track how much leftovers a meal typically produces
* Meal Planning
  * Meal plan proposals (allow family members to propose meal plans for the future and maybe vote on them)
  * Tentative meals
  * Allow "leftovers" to be a meal
  * Number participants in a meal
  * Allow "eating out" to be a meal (put it at the bottom to discourage it)
  * Nudge users to make meals they haven't made in a while
    * Liked meals that haven't been made in a while go toward the top
    * Frequently-made meals go toward the middle
    * Disliked meals that haven't been made in a while go toward the bottom
* Stock Tracking
  * Make it easy to access from the app (maybe a widget?)
  * Keep track of the most often accessed items and put them at the top
  * Add the current meal plan to the top of the list
  * Allow for "shopping lists" to be created from the stock list
  * Allow users to scan barcodes to add things to the list
  * Allow users to add a location for each item (e.g. "Fridge, top shelf")
    * Provide presets
    * Allow users to add their own (and save them)

### Desired Features
* Nutritional Information
  * Provide nutrition insights based on the ingredients used
  * Allow users to set nutritional goals
  * Enter ballpark estimates of how much of a meal is eaten
* Recipe Browsing
  * Allow users to share recipes with the world
  * Allow users to share recipes exclusively with their friends and family
  * Take allergies & dietary restrictions into account when browsing for recipes
  * Allow users to filter recipes by:
    * Ingredients
    * Popularity
    * Rating
    * Allergies & Dietary Restrictions (default to household's restrictions)
      * Allow users to save restriction presets


## Before Release
* [ ] Make route configs not optional
* [ ] Recreate config templates
