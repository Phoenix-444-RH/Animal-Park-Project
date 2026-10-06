function button(label, action) {
  return { label, action };
}

function route(pathname, query = {}) {
  return { type: "route", pathname, query };
}

function formatMoney(value) {
  return `Rs. ${value}`;
}

export function getChatbotResponse(intent, context = {}, entities = {}) {
  const firstName = context.userName ? context.userName.split(" ")[0] : "there";
  const petLabel = entities.petType === "cats" ? "cats" : entities.petType === "dogs" ? "dogs" : "pets";
  const minRating = entities.minRating ?? null;

  if (intent === "greeting") {
    return {
      line1: `Hello ${firstName}, I’m Paws.`,
      body: [
        "I can help you shop, compare vets, book grooming, check tracking, and get pet-care guidance quickly."
      ],
      action: "Choose a direction and I’ll take you there.",
      question: "What would you like to do first?",
      buttons: [
        button("Open Shop", route("/shop")),
        button("Best Vets", route("/vets")),
        button("Best Groomers", route("/groomers")),
        button("Dashboard", route(context.isLoggedIn ? "/dashboard" : "/login"))
      ]
    };
  }

  if (intent === "shop") {
    return {
      line1: "I can open the product catalog for you.",
      body: [
        context.cartCount
          ? `You already have ${context.cartCount} item${context.cartCount > 1 ? "s" : ""} in your cart.`
          : "You can browse food, accessories, toys, and travel essentials there."
      ],
      question: "Would you like the full shop or a food-only view?",
      buttons: [
        button("Open Shop", route("/shop")),
        button("Dog Food", route("/shop", { category: "dogs", subcategory: "Food" })),
        button("Cat Food", route("/shop", { category: "cats", subcategory: "Food" })),
        button("View Cart", route("/cart"))
      ]
    };
  }

  if (intent === "book_groomer") {
    const query = {};
    if (entities.petType) query.petType = entities.petType === "dogs" ? "Dog" : "Cat";
    if (entities.minRating != null) query.minRating = String(entities.minRating);
    if (entities.city) query.location = entities.city;

    return {
      line1: "I found the right grooming route for you.",
      body: [
        minRating != null
          ? `I’ll take you to groomers rated ${minRating} and above${entities.city ? ` in ${entities.city}` : ""}.`
          : `I can take you to the grooming marketplace${entities.city ? ` in ${entities.city}` : ""}.`
      ],
      action: "You can compare spas, select services, and choose a slot there.",
      buttons: [
        button("Open Groomers", route("/groomers", query)),
        button("Dog Grooming", route("/groomers", { ...query, petType: "Dog" })),
        button("Cat Grooming", route("/groomers", { ...query, petType: "Cat" }))
      ],
      autoAction: route("/groomers", query)
    };
  }

  if (intent === "book_vet") {
    const query = {};
    if (entities.specialization) query.specialization = entities.specialization;
    if (entities.minRating != null) query.rating = String(entities.minRating);
    if (entities.city) query.city = entities.city;

    return {
      line1: "I can take you to the right consultation options.",
      body: [
        entities.specialization
          ? `I’ll open ${entities.specialization.toLowerCase()} clinics${minRating != null ? ` rated ${minRating} and above` : ""}.`
          : minRating != null
            ? `I’ll open vet clinics rated ${minRating} and above.`
            : "I’ll open the vets section so you can compare clinics, fees, and experience."
      ],
      action: "You can choose the clinic service and move into payment from there.",
      buttons: [
        button("Open Vets", route("/vets", query)),
        button("Emergency Vets", route("/vets", { ...query, specialization: "Emergency" })),
        button("Dental Vets", route("/vets", { ...query, specialization: "Dental" }))
      ],
      autoAction: route("/vets", query)
    };
  }

  if (intent === "track") {
    return {
      line1: context.activeGroomingCount || context.activeOrderCount ? "I found active updates on your account." : "The dashboard is the best place to check tracking.",
      body: [
        context.activeGroomingCount ? `Active grooming sessions: ${context.activeGroomingCount}.` : null,
        context.activeOrderCount ? `Active product orders: ${context.activeOrderCount}.` : null,
        !context.activeGroomingCount && !context.activeOrderCount ? "You can review orders, bookings, and live progress there." : null
      ].filter(Boolean),
      buttons: [
        button("Open Dashboard", route(context.isLoggedIn ? "/dashboard" : "/login"))
      ],
      autoAction: route(context.isLoggedIn ? "/dashboard" : "/login")
    };
  }

  if (intent === "subscription") {
    return {
      line1: context.isPremium ? "Your premium benefits are active." : "I can help you review premium benefits.",
      body: [
        context.isPremium
          ? "Member perks like waived delivery and premium pricing already apply where supported."
          : "The premium section inside the dashboard explains current benefits and upgrade context."
      ],
      buttons: [button("Open Dashboard", route(context.isLoggedIn ? "/dashboard" : "/login"))]
    };
  }

  if (intent === "payment") {
    return {
      line1: "I can guide you to the right payment step.",
      body: [
        context.hasCheckoutDraft
          ? "You already have an active checkout draft, so I can open payment directly."
          : context.cartCount
            ? "Your cart is ready, so cart is the cleanest next step before payment."
            : "If there is no active checkout, I’ll take you to the closest payment-ready flow."
      ],
      buttons: [
        button("Open Payment", route(context.hasCheckoutDraft ? "/payment" : context.cartCount ? "/cart" : context.isLoggedIn ? "/dashboard" : "/login")),
        button("View Cart", route("/cart"))
      ]
    };
  }

  if (intent === "dashboard") {
    return {
      line1: "Your dashboard is the control center for Animal Park.",
      body: ["That’s the best place to review orders, grooming, consultations, notifications, and premium status."],
      buttons: [button("Go to Dashboard", route(context.isLoggedIn ? "/dashboard" : "/login"))],
      autoAction: route(context.isLoggedIn ? "/dashboard" : "/login")
    };
  }

  if (intent === "support_chat") {
    return {
      line1: "I can guide you to the closest support flow available here.",
      body: [context.activeGroomingCount ? "For active grooming, the dashboard also gives you the live chat and tracking view." : "The dashboard is the best place to review bookings, alerts, and active support flows."],
      buttons: [button("Open Dashboard", route(context.isLoggedIn ? "/dashboard" : "/login"))]
    };
  }

  if (intent === "food_help") {
    const foodProducts = (context.products || []).filter((product) => product.subcategory === "Food" && (!entities.petType || product.category === entities.petType));
    const topPicks = foodProducts.slice(0, 3);
    return {
      line1: `Here are some good food picks for ${petLabel}.`,
      body: topPicks.length
        ? topPicks.map((product) => `${product.name} - ${formatMoney(product.price)}. ${product.description}`)
        : ["I can take you to the food section and help you browse the best current options."],
      action: entities.petType === "dogs"
        ? "For dogs, digestible protein, clean ingredients, and age-appropriate nutrition are a good place to start."
        : entities.petType === "cats"
          ? "For cats, protein-rich food and hydration-friendly meals are usually a good direction."
          : "I can open the food catalog and narrow it down by pet type.",
      buttons: [
        button("Dog Food", route("/shop", { category: "dogs", subcategory: "Food" })),
        button("Cat Food", route("/shop", { category: "cats", subcategory: "Food" })),
        button("Open Shop", route("/shop"))
      ]
    };
  }

  if (intent === "symptom_help") {
    const isDog = entities.petType === "dogs";
    const isCat = entities.petType === "cats";
    return {
      line1: isDog || isCat ? `Here’s a safe first-aid direction for your ${isDog ? "dog" : "cat"}.` : "Here’s the safest next step I can suggest.",
      body: [
        "Keep them hydrated, avoid heavy treats, and let them rest for now.",
        "If stomach upset is mild, a bland meal and clean water can help temporarily, but this is not a diagnosis.",
        "If there is repeated vomiting, bloating, blood, weakness, fever, or severe pain, book a vet immediately."
      ],
      action: "I would avoid giving random human medicines without a vet’s advice.",
      question: "Would you like me to open the vet section for the fastest next step?",
      buttons: [button("Book Vet", route("/vets")), button("Emergency Vets", route("/vets", { specialization: "Emergency" }))]
    };
  }

  if (intent === "exercise_help") {
    return {
      line1: `Here are some exercise ideas for ${petLabel}.`,
      body: entities.petType === "cats"
        ? [
            "Short toy-chase bursts, climbing play, and treat puzzles work well for indoor cats.",
            "Aim for two or three 10-minute play windows instead of one long session."
          ]
        : entities.petType === "dogs"
          ? [
              "Try a brisk walk, short fetch sessions, scent games, or light obedience drills.",
              "Mix movement with mental stimulation so the routine stays engaging."
            ]
          : [
              "Daily movement, enrichment toys, and short training games are a strong baseline for most pets.",
              "I can also help you find food, vets, or grooming based on what your pet needs next."
            ],
      buttons: [
        button("Book Grooming", route("/groomers")),
        button("Open Shop", route("/shop")),
        button("Book Vet", route("/vets"))
      ]
    };
  }

  if (intent === "thanks") {
    return {
      line1: "Happy to help.",
      body: ["If you need another quick action, I can guide you to shopping, bookings, tracking, or care advice."],
      buttons: [
        button("Open Shop", route("/shop")),
        button("Book Grooming", route("/groomers")),
        button("Go to Dashboard", route(context.isLoggedIn ? "/dashboard" : "/login"))
      ]
    };
  }

  return {
    line1: "I can help with the closest option here.",
    body: [
      "Try asking for the best groomers, good food for dogs or cats, a vet for symptoms, order tracking, or dashboard help."
    ],
    question: "Which direction would you like?",
    buttons: [
      button("Best Groomers", route("/groomers")),
      button("Best Vets", route("/vets")),
      button("Dog Food", route("/shop", { category: "dogs", subcategory: "Food" })),
      button("Go to Dashboard", route(context.isLoggedIn ? "/dashboard" : "/login"))
    ]
  };
}
