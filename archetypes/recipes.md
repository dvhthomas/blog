---
title: {{ replace .Name "-" " " | title }}
date: {{ .Date }}
summary: ""
toc: true
draft: true
images: []
# Recipe taxonomies
cuisines: []    # e.g., ["Italian"], ["Thai", "Asian"]
categories: []  # e.g., ["Dinner"], ["Dessert", "Baking"]
diets: []       # e.g., ["Vegetarian"], ["Vegan", "Gluten-Free"]
# Recipe metadata
prepTime: "PT15M"    # ISO8601 duration: PT15M = 15 minutes
cookTime: "PT30M"    # PT30M = 30 minutes, PT1H = 1 hour
totalTime: "PT45M"   # PT45M = 45 minutes
yield: 4
yieldUnit: "servings"
difficulty: "Easy"   # Easy, Intermediate, Advanced
---

Brief introduction or story about this recipe. What makes it special? Where did you learn it?

{{</* recipe */>}}

### Ingredients

{{</* ingredients */>}}
- 2 cups ingredient one
- 1 cup ingredient two
- 1 tsp seasoning or spice
- Salt and pepper to taste
{{</* /ingredients */>}}

### Instructions

{{</* instructions */>}}

**Prep your ingredients:** Get everything ready before you start cooking. This includes chopping vegetables, measuring ingredients, and preheating your oven if needed.

**Cook the base:** Start with your main cooking step. Describe the technique, temperature, and timing. What should it look like or smell like when it's ready?

**Combine and finish:** Bring everything together. Add final seasonings, adjust consistency, and plate or serve as desired.

{{</* /instructions */>}}

### Notes

**Storage:** How to store leftovers and how long they keep.

**Variations:** Ideas for substitutions or alternative ingredients.

**Tips:** Any helpful tricks or things to watch out for.

{{</* /recipe */>}}
