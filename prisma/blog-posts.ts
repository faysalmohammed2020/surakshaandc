import { assets } from "../data/assets";

type Article = { title: string; summary: string; sections: [string, string][]; tips: string[] };
type SeedArticle = { slug: string; image: string; en: Article; bn: Article };

/** Ten parent resources, with a separate article for each site language. */
export const parentArticles: SeedArticle[] = [
  {
    slug: "preparing-for-developmental-assessment", image: assets.consultation,
    en: {
      title: "Preparing for Your Child’s First Developmental Assessment",
      summary: "A little preparation can help families explain their concerns and make the first visit more comfortable.",
      sections: [
        ["Start with your everyday observations", "Write down what your child enjoys, how they ask for help and which daily routines feel difficult. Specific examples give the team a clearer picture than comparing your child with another child. Include strengths as well as concerns."],
        ["Bring the story together", "Gather previous reports and notes from school, if available. Tell the team about languages spoken at home, hearing concerns and changes you have noticed. You do not need a perfect record to begin a conversation."],
        ["Leave with a clear next step", "Ask what the assessment can explain, whether other appointments are needed and when you will discuss findings. Before leaving, agree who to contact with questions and how the recommendations will fit family life."],
      ],
      tips: ["Bring a familiar comfort item.", "Note your three most important questions.", "Tell staff about any adjustments your child needs."],
    },
    bn: {
      title: "শিশুর প্রথম বিকাশ মূল্যায়নের আগে যেভাবে প্রস্তুতি নেবেন",
      summary: "কিছু সহজ প্রস্তুতি আপনার উদ্বেগ বোঝাতে এবং প্রথম সাক্ষাৎ শিশুর জন্য স্বস্তিকর করতে সাহায্য করবে।",
      sections: [
        ["দৈনন্দিন অভিজ্ঞতা লিখে রাখুন", "শিশু কী পছন্দ করে, কীভাবে সাহায্য চায় এবং কোন কাজে অসুবিধা হয় তা লিখুন। অন্য শিশুর সঙ্গে তুলনার বদলে বাস্তব উদাহরণ দিন। অসুবিধার পাশাপাশি শিশুর আগ্রহ ও ভালো পারার বিষয়গুলোও জানান।"],
        ["প্রয়োজনীয় তথ্য সঙ্গে নিন", "আগের মূল্যায়নের প্রতিবেদন ও বিদ্যালয়ের পর্যবেক্ষণ থাকলে আনুন। বাড়িতে ব্যবহৃত ভাষা, শোনা নিয়ে উদ্বেগ এবং বিকাশে কোনো পরিবর্তন লক্ষ করলে দলকে বলুন। সব নথি না থাকলেও আলোচনা শুরু করা যায়।"],
        ["পরবর্তী পদক্ষেপ বুঝে নিন", "মূল্যায়ন থেকে কী জানা যাবে, অন্য বিশেষজ্ঞের পরামর্শ লাগবে কি না এবং ফলাফল কবে আলোচনা হবে জিজ্ঞেস করুন। পরিবারের দৈনন্দিন জীবনে পরামর্শগুলো কীভাবে কাজে লাগাবেন সেটিও বুঝে নিন।"],
      ],
      tips: ["শিশুর পরিচিত ও স্বস্তিদায়ক কোনো জিনিস আনুন।", "আপনার সবচেয়ে জরুরি তিনটি প্রশ্ন লিখুন।", "শিশুর জন্য বিশেষ ব্যবস্থা লাগলে আগে জানান।"],
    },
  },
  {
    slug: "understanding-individual-autism-support", image: assets.therapistsWithChild,
    en: {
      title: "Understanding Autism Support: Begin with the Individual Child",
      summary: "Useful support begins with understanding a child’s strengths, preferences and everyday needs.",
      sections: [
        ["Make space for differences", "Autistic children can have different communication styles, interests and support needs. A diagnosis alone does not describe a child’s whole personality. Ask what helps your child feel comfortable and participate in family life."],
        ["Choose meaningful priorities", "Bring the team an example of one activity you want to make easier, such as asking for a break or joining a meal. Discuss options, the reasons for each recommendation and how your child’s comfort will be respected."],
        ["Review the plan together", "Ask how progress will be discussed and what would prompt a change. Keep a short record of useful observations. Support should respond to the child rather than rely on promises that every child will achieve the same outcome."],
      ],
      tips: ["Share your child’s interests with the team.", "Ask for explanations in familiar language.", "Include the child’s choices wherever possible."],
    },
    bn: {
      title: "অটিজমে সহায়তা: প্রতিটি শিশুকে আলাদাভাবে বোঝা জরুরি",
      summary: "শিশুর শক্তি, পছন্দ ও দৈনন্দিন প্রয়োজন বুঝে সহায়তার পরিকল্পনা শুরু করা যায়।",
      sections: [
        ["ভিন্নতাকে জায়গা দিন", "অটিস্টিক শিশুদের যোগাযোগের ধরন, আগ্রহ ও সহায়তার প্রয়োজন আলাদা হতে পারে। শুধু রোগনির্ণয় দিয়ে একটি শিশুর সম্পূর্ণ পরিচয় বোঝা যায় না। কোন পরিবেশে আপনার শিশু স্বস্তি পায় ও অংশ নিতে পারে তা খেয়াল করুন।"],
        ["অর্থবহ অগ্রাধিকার ঠিক করুন", "কোন কাজটি সহজ করতে চান তার একটি উদাহরণ দলকে দিন। সেটি বিরতি চাওয়া বা পরিবারের সঙ্গে খাবারে অংশ নেওয়া হতে পারে। প্রতিটি পরামর্শের কারণ এবং শিশুর স্বস্তি কীভাবে বজায় থাকবে জেনে নিন।"],
        ["একসঙ্গে পরিকল্পনা পর্যালোচনা করুন", "অগ্রগতি কীভাবে আলোচনা হবে এবং কখন পরিকল্পনা বদলানো দরকার তা জিজ্ঞেস করুন। উপকারী পর্যবেক্ষণ সংক্ষেপে লিখুন। সবার একই ফল হবে এমন প্রতিশ্রুতির বদলে শিশুর নিজস্ব প্রয়োজন অনুযায়ী সহায়তা বেছে নিন।"],
      ],
      tips: ["শিশুর আগ্রহের বিষয়গুলো দলকে জানান।", "সহজ ভাষায় ব্যাখ্যা চাইতে দ্বিধা করবেন না।", "যেখানে সম্ভব শিশুর পছন্দকে গুরুত্ব দিন।"],
    },
  },
  {
    slug: "communication-in-everyday-routines", image: assets.therapistBlocks,
    en: {
      title: "Making Room for Communication in Everyday Routines",
      summary: "Meals, dressing and play offer natural opportunities to connect with your child without turning the day into a test.",
      sections: [
        ["Notice every way your child communicates", "A look, gesture, picture or sound can carry a message. Notice what your child is trying to share and respond to that meaning. Spoken words are only one part of communication."],
        ["Build a small moment into the day", "Choose a relaxed routine and describe what is happening in simple language. Pause to give your child room to respond. Share a picture book or talk about a favourite toy without asking a question on every page or turn."],
        ["Ask for an individual approach", "If communication is difficult, bring examples to a speech and language professional. Ask about suitable supports, including pictures or other communication tools. Use languages you are comfortable speaking with your child."],
      ],
      tips: ["Respond to gestures as well as words.", "Allow time for a response.", "Keep shared activities enjoyable."],
    },
    bn: {
      title: "দৈনন্দিন কাজের মধ্যেই শিশুর যোগাযোগের সুযোগ তৈরি করুন",
      summary: "খাওয়া, পোশাক পরা ও খেলার সময় শিশুর সঙ্গে সংযোগের সুযোগ থাকে; দিনভর পরীক্ষা নেওয়ার দরকার নেই।",
      sections: [
        ["যোগাযোগের সব ধরন খেয়াল করুন", "তাকানো, ইশারা, ছবি দেখানো বা শব্দ করার মধ্যেও বার্তা থাকতে পারে। শিশু কী বোঝাতে চাইছে তা খেয়াল করে সাড়া দিন। যোগাযোগ শুধু মুখে বলা কথার মধ্যে সীমাবদ্ধ নয়।"],
        ["দিনের মধ্যে ছোট একটি সময় রাখুন", "স্বস্তিকর একটি কাজ বেছে নিয়ে সহজ ভাষায় কী হচ্ছে বলুন। মাঝে থেমে শিশুকে সাড়া দেওয়ার সময় দিন। ছবির বই দেখুন বা পছন্দের খেলনা নিয়ে কথা বলুন। প্রতি পাতায় বা প্রতি মুহূর্তে প্রশ্ন করার প্রয়োজন নেই।"],
        ["শিশু অনুযায়ী পরামর্শ নিন", "যোগাযোগে অসুবিধা হলে বাক্ ও ভাষা বিশেষজ্ঞকে বাস্তব উদাহরণ জানান। ছবি বা অন্য যোগাযোগের উপকরণ উপযোগী হবে কি না জিজ্ঞেস করুন। যে ভাষায় আপনি স্বচ্ছন্দ, শিশুর সঙ্গে সেই ভাষায় কথা বলুন।"],
      ],
      tips: ["কথার পাশাপাশি ইশারাতেও সাড়া দিন।", "উত্তরের জন্য সময় দিন।", "একসঙ্গে কাটানো সময় আনন্দময় রাখুন।"],
    },
  },
  {
    slug: "occupational-therapy-daily-participation", image: assets.toddlersPainting,
    en: {
      title: "Occupational Therapy and Participation in Daily Life",
      summary: "Explore everyday goals with your child’s therapist, from getting dressed to taking part in classroom activities.",
      sections: [
        ["Start with a real task", "Occupational therapy can support everyday independence. Describe a task your child wants or needs to do, and explain where it becomes difficult. Bringing a description of the setting can help the discussion."],
        ["Discuss the environment too", "Ask whether the task, tools or surroundings could be adjusted. A family’s priorities, available space and daily schedule matter when deciding what is practical. Agree how much help your child needs rather than rushing independence."],
        ["Make observations useful", "Notice which part of the agreed task feels easier and which still needs help. Share this at review. Ask the therapist before introducing specialist equipment or exercises you have seen online."],
      ],
      tips: ["Choose one everyday priority.", "Ask for a demonstration of agreed activities.", "Report discomfort and difficulties promptly."],
    },
    bn: {
      title: "অকুপেশনাল থেরাপি ও দৈনন্দিন কাজে অংশগ্রহণ",
      summary: "পোশাক পরা থেকে শ্রেণিকক্ষের কাজে অংশ নেওয়া—শিশুর দৈনন্দিন লক্ষ্য নিয়ে থেরাপিস্টের সঙ্গে কথা বলুন।",
      sections: [
        ["বাস্তব একটি কাজ দিয়ে শুরু করুন", "অকুপেশনাল থেরাপি দৈনন্দিন স্বনির্ভরতায় সহায়তা করতে পারে। শিশু কোন কাজটি করতে চায় বা করা দরকার এবং কোথায় অসুবিধা হচ্ছে তা জানান। কাজের পরিবেশের বর্ণনাও আলোচনায় সাহায্য করে।"],
        ["পরিবেশ নিয়েও আলোচনা করুন", "কাজের ধরন, ব্যবহৃত উপকরণ বা আশপাশে পরিবর্তন করা যায় কি না জিজ্ঞেস করুন। পরিবারের অগ্রাধিকার, জায়গা ও সময় অনুযায়ী পরিকল্পনা বাস্তবসম্মত হওয়া দরকার। তাড়াহুড়া না করে কতটুকু সহায়তা লাগবে ঠিক করুন।"],
        ["পর্যবেক্ষণ কাজে লাগান", "নির্ধারিত কাজের কোন অংশ সহজ হচ্ছে এবং কোথায় সাহায্য লাগছে খেয়াল করুন। পর্যালোচনায় সেটি জানান। অনলাইনে দেখা বিশেষ সরঞ্জাম বা ব্যায়াম শুরু করার আগে থেরাপিস্টের পরামর্শ নিন।"],
      ],
      tips: ["দৈনন্দিন একটি অগ্রাধিকার বেছে নিন।", "নির্ধারিত কাজটি করে দেখাতে বলুন।", "অস্বস্তি বা অসুবিধা হলে দ্রুত জানান।"],
    },
  },
  {
    slug: "sensory-comfort-away-from-home", image: assets.sensoryRoom,
    en: {
      title: "Planning for Sensory Comfort Away from Home",
      summary: "A simple family plan can make unfamiliar places more predictable and help you explain your child’s preferences.",
      sections: [
        ["Describe what you notice", "Write down which sounds, lights or busy settings your child finds uncomfortable and what they appear to enjoy. Record the context without assuming every difficult moment has the same cause."],
        ["Plan a manageable visit", "Before an outing, ask about quieter times, waiting arrangements and a place to pause. Explain what will happen in a way your child understands. Allow room to leave earlier if needed."],
        ["Share the pattern with the team", "Bring recurring concerns to your child’s clinician or occupational therapist. Ask which environmental adjustments suit your child. A sensory room or a particular product is not automatically the right choice for every child."],
      ],
      tips: ["Check the setting before you go.", "Agree how your child can ask for a break.", "Keep an alternative plan for the outing."],
    },
    bn: {
      title: "বাড়ির বাইরে শিশুর ইন্দ্রিয়গত স্বস্তির পরিকল্পনা",
      summary: "সহজ একটি পারিবারিক পরিকল্পনা অপরিচিত পরিবেশ বোঝাতে এবং শিশুর পছন্দ অন্যদের জানাতে সাহায্য করে।",
      sections: [
        ["যা দেখছেন তা লিখুন", "কোন শব্দ, আলো বা ব্যস্ত পরিবেশে শিশুর অস্বস্তি হয় এবং কী ভালো লাগে তা লিখুন। প্রতিটি কঠিন মুহূর্তের কারণ এক ধরে না নিয়ে ঘটনার পরিস্থিতি খেয়াল করুন।"],
        ["সহজভাবে বেড়ানোর পরিকল্পনা করুন", "বাইরে যাওয়ার আগে কম ভিড়ের সময়, অপেক্ষার ব্যবস্থা ও বিরতি নেওয়ার জায়গা সম্পর্কে জেনে নিন। শিশুর বোঝার উপযোগী করে কী হবে জানান। প্রয়োজন হলে আগে ফিরে আসার সুযোগ রাখুন।"],
        ["দলকে অভিজ্ঞতা জানান", "বারবার একই অসুবিধা হলে চিকিৎসক বা অকুপেশনাল থেরাপিস্টকে বলুন। পরিবেশে কোন পরিবর্তন শিশুর জন্য উপযোগী জিজ্ঞেস করুন। কোনো বিশেষ কক্ষ বা পণ্য সব শিশুর জন্য একইভাবে উপযোগী হবে এমন নয়।"],
      ],
      tips: ["যাওয়ার আগে পরিবেশ সম্পর্কে জানুন।", "শিশু কীভাবে বিরতি চাইবে ঠিক করুন।", "বিকল্প পরিকল্পনা রাখুন।"],
    },
  },
  {
    slug: "playtime-without-pressure", image: assets.kidsTableGame,
    en: {
      title: "Shared Playtime Without Pressure to Perform",
      summary: "Follow your child’s interests and make space for enjoyable time together, with no need to turn every game into a lesson.",
      sections: [
        ["Begin with what interests your child", "Choose a familiar, age-appropriate activity and notice how your child wants to use it. Sit nearby and offer to join. Shared enjoyment can be the purpose of the activity itself."],
        ["Keep participation flexible", "You might take turns building, drawing or looking at pictures. Offer a choice and accept a pause or a refusal. There is no need to insist on eye contact, spoken answers or a particular way of playing."],
        ["Talk about support when needed", "If you want to practise a goal during play, ask the therapist how to do so while keeping the activity comfortable. Explain which games your child enjoys and what makes joining in difficult."],
      ],
      tips: ["Offer safe materials suitable for the child.", "Let the child choose between two activities.", "Stop or adapt when interest fades."],
    },
    bn: {
      title: "চাপ ছাড়াই শিশুর সঙ্গে আনন্দময় খেলার সময়",
      summary: "শিশুর আগ্রহকে অনুসরণ করে একসঙ্গে আনন্দের সময় কাটান; প্রতিটি খেলাকে পাঠ বানানোর প্রয়োজন নেই।",
      sections: [
        ["শিশুর আগ্রহ দিয়ে শুরু করুন", "পরিচিত ও বয়সের উপযোগী একটি খেলা বেছে নিন। শিশু সেটি কীভাবে ব্যবহার করতে চায় খেয়াল করুন। কাছে বসে যোগ দেওয়ার সুযোগ চান। একসঙ্গে আনন্দ করাই খেলার উদ্দেশ্য হতে পারে।"],
        ["অংশগ্রহণে নমনীয় থাকুন", "পালা করে কিছু বানানো, আঁকা বা ছবি দেখা যেতে পারে। পছন্দের সুযোগ দিন এবং বিরতি বা না বলাকে গ্রহণ করুন। চোখে চোখ রাখা, মুখে উত্তর দেওয়া বা নির্দিষ্টভাবে খেলায় জোর করার দরকার নেই।"],
        ["প্রয়োজনে সহায়তা নিয়ে আলোচনা করুন", "খেলার মধ্যে কোনো লক্ষ্য অনুশীলন করতে চাইলে কীভাবে স্বস্তি বজায় রাখা যায় থেরাপিস্টকে জিজ্ঞেস করুন। কোন খেলা শিশুর ভালো লাগে এবং যোগ দিতে কোথায় অসুবিধা হয় জানান।"],
      ],
      tips: ["শিশুর উপযোগী নিরাপদ উপকরণ দিন।", "দুটি খেলার মধ্যে বেছে নেওয়ার সুযোগ দিন।", "আগ্রহ কমলে থামুন বা খেলা বদলান।"],
    },
  },
  {
    slug: "building-a-practical-home-plan", image: assets.familyGroup,
    en: {
      title: "Building a Home Plan That Fits Family Life",
      summary: "An agreed home plan should be understandable, manageable and easy to discuss with your child’s team.",
      sections: [
        ["Explain what your day really looks like", "Tell the team who supports your child, which routines are busy and what resources are available. A plan is more useful when it fits the people who will use it."],
        ["Clarify the details before starting", "Ask the professional to demonstrate the agreed activity and explain when to pause. Check that every caregiver understands the same instructions. Discuss how to adapt the plan if a routine changes."],
        ["Keep feedback simple", "A short note about what you tried, what your child chose and what was difficult can support the next conversation. If the plan feels unmanageable, say so. The review is a chance to adjust expectations together."],
      ],
      tips: ["Begin with an agreed, manageable activity.", "Ask who to contact if instructions are unclear.", "Make room for ordinary family time and rest."],
    },
    bn: {
      title: "পারিবারিক জীবনের সঙ্গে মানানসই বাড়ির পরিকল্পনা",
      summary: "বাড়িতে অনুশীলনের পরিকল্পনা সহজবোধ্য ও বাস্তবসম্মত হওয়া দরকার, যাতে দলকে অভিজ্ঞতা জানানো যায়।",
      sections: [
        ["আপনাদের দিনের বাস্তব চিত্র জানান", "শিশুকে কারা সহায়তা করেন, কোন সময় ব্যস্ততা বেশি এবং কী উপকরণ আছে দলকে বলুন। যাঁরা পরিকল্পনা অনুসরণ করবেন তাঁদের পরিস্থিতির সঙ্গে মিললে সেটি বেশি কাজে লাগে।"],
        ["শুরু করার আগে বুঝে নিন", "নির্ধারিত কাজটি বিশেষজ্ঞকে করে দেখাতে বলুন এবং কখন বিরতি দেবেন জানুন। সব পরিচর্যাকারী একই নির্দেশনা বুঝেছেন কি না নিশ্চিত করুন। দৈনন্দিন সময় বদলালে কী করবেন আলোচনা করুন।"],
        ["অভিজ্ঞতা সহজভাবে লিখুন", "কী চেষ্টা করেছেন, শিশু কী বেছে নিয়েছে এবং কোথায় অসুবিধা হয়েছে তার ছোট নোট পরবর্তী আলোচনায় কাজে আসে। পরিকল্পনা পালন কঠিন মনে হলে জানান। একসঙ্গে প্রত্যাশা ঠিক করার সুযোগই হলো পর্যালোচনা।"],
      ],
      tips: ["সম্মত ও সহজ একটি কাজ দিয়ে শুরু করুন।", "নির্দেশনা অস্পষ্ট হলে কাকে জিজ্ঞেস করবেন জানুন।", "পারিবারিক সময় ও বিশ্রামের সুযোগ রাখুন।"],
    },
  },
  {
    slug: "preparing-for-inclusive-classroom", image: assets.kidsClassroom,
    en: {
      title: "Preparing Together for an Inclusive Classroom",
      summary: "Families, teachers and support professionals can discuss practical arrangements before a child starts a new classroom.",
      sections: [
        ["Share more than a report", "Give the teacher a short introduction to your child’s interests, communication and helpful routines. Include how the child asks for help and what may make a new setting difficult."],
        ["Ask about the whole school day", "Discuss arrival, lessons, meals, breaks and leaving school. Ask how adjustments will be agreed and who will coordinate them. Participation may require changes to the environment as well as support for the child."],
        ["Arrange a way to stay in touch", "Agree on a practical communication method and a date to review the transition. Share what is going well alongside concerns. Ask how the child’s experience and choices will be included in planning."],
      ],
      tips: ["Ask about a familiarisation visit.", "Choose a named contact at school.", "Review support as classroom needs change."],
    },
    bn: {
      title: "অন্তর্ভুক্তিমূলক শ্রেণিকক্ষের জন্য একসঙ্গে প্রস্তুতি",
      summary: "নতুন শ্রেণিকক্ষে যাওয়ার আগে পরিবার, শিক্ষক ও সংশ্লিষ্ট বিশেষজ্ঞরা ব্যবহারিক ব্যবস্থা নিয়ে আলোচনা করতে পারেন।",
      sections: [
        ["প্রতিবেদনের বাইরেও শিশুর পরিচয় দিন", "শিশুর আগ্রহ, যোগাযোগের ধরন ও সহায়ক অভ্যাস নিয়ে শিক্ষককে সংক্ষেপে জানান। শিশু কীভাবে সাহায্য চায় এবং নতুন পরিবেশে কোথায় অসুবিধা হতে পারে সেটিও বলুন।"],
        ["বিদ্যালয়ের পুরো দিন নিয়ে কথা বলুন", "আসা, পাঠ, খাবার, বিরতি ও বাড়ি ফেরা নিয়ে আলোচনা করুন। প্রয়োজনীয় পরিবর্তন কে সমন্বয় করবেন জানুন। অংশগ্রহণের জন্য শিশুকে সহায়তা দেওয়ার পাশাপাশি পরিবেশেও পরিবর্তন লাগতে পারে।"],
        ["যোগাযোগের ব্যবস্থা ঠিক করুন", "সহজ একটি যোগাযোগের মাধ্যম ও শুরুর অভিজ্ঞতা পর্যালোচনার দিন ঠিক করুন। উদ্বেগের সঙ্গে ভালো অভিজ্ঞতাও জানান। পরিকল্পনায় শিশুর অভিজ্ঞতা ও পছন্দ কীভাবে গুরুত্ব পাবে জিজ্ঞেস করুন।"],
      ],
      tips: ["আগে গিয়ে পরিচিত হওয়ার সুযোগ আছে কি না জানুন।", "বিদ্যালয়ে একজন নির্দিষ্ট যোগাযোগকারী ঠিক করুন।", "প্রয়োজন বদলালে সহায়তাও পর্যালোচনা করুন।"],
    },
  },
  {
    slug: "making-therapy-reviews-meaningful", image: assets.caseConference,
    en: {
      title: "Making Therapy Reviews Meaningful for Your Family",
      summary: "Use review appointments to connect the agreed goals with your child’s experience at home and school.",
      sections: [
        ["Bring concrete examples", "Instead of only asking whether progress is good, describe what has changed in a familiar activity. Include the support your child still needs and whether the change happens in more than one setting."],
        ["Ask what the information means", "Request an explanation of any measures or notes the team uses. Discuss comfort, participation and family priorities alongside the goal itself. A number alone may not capture the whole experience."],
        ["Agree the next decision", "Ask whether to continue, adapt or replace a goal, and why. Leave with a shared understanding of what happens next and when you will meet again. Raise new concerns even if they were not part of the original plan."],
      ],
      tips: ["Bring a brief note from home or school.", "Ask about anything you do not understand.", "Keep a copy of the agreed next steps."],
    },
    bn: {
      title: "থেরাপির অগ্রগতি পর্যালোচনা পরিবারের জন্য অর্থবহ করুন",
      summary: "পর্যালোচনার সময় নির্ধারিত লক্ষ্যকে বাড়ি ও বিদ্যালয়ে শিশুর বাস্তব অভিজ্ঞতার সঙ্গে মিলিয়ে দেখুন।",
      sections: [
        ["বাস্তব উদাহরণ আনুন", "শুধু উন্নতি ভালো কি না জিজ্ঞেস না করে পরিচিত কাজে কী পরিবর্তন হয়েছে বলুন। এখনো কতটুকু সহায়তা লাগছে এবং ভিন্ন পরিবেশেও পরিবর্তনটি দেখা যায় কি না জানান।"],
        ["তথ্যের অর্থ বুঝে নিন", "দল যে পরিমাপ বা নোট ব্যবহার করে তার ব্যাখ্যা চান। লক্ষ্যের পাশাপাশি শিশুর স্বস্তি, অংশগ্রহণ ও পরিবারের অগ্রাধিকার আলোচনা করুন। শুধু একটি সংখ্যা দিয়ে পুরো অভিজ্ঞতা বোঝা যায় না।"],
        ["পরবর্তী সিদ্ধান্ত একসঙ্গে নিন", "লক্ষ্যটি চালিয়ে যাবেন, বদলাবেন নাকি নতুন লক্ষ্য নেবেন এবং কেন তা জিজ্ঞেস করুন। এরপর কী হবে ও কবে আবার আলোচনা করবেন স্পষ্ট করুন। আগের পরিকল্পনার বাইরে নতুন উদ্বেগ থাকলেও জানান।"],
      ],
      tips: ["বাড়ি বা বিদ্যালয়ের সংক্ষিপ্ত পর্যবেক্ষণ আনুন।", "যা বুঝতে পারেননি তা জিজ্ঞেস করুন।", "পরবর্তী পদক্ষেপের একটি কপি রাখুন।"],
    },
  },
  {
    slug: "coordinating-child-support-team", image: assets.teamMeeting,
    en: {
      title: "Helping Your Child’s Support Team Work Together",
      summary: "Clear communication between family, school and professionals helps everyone understand the same priorities.",
      sections: [
        ["Make the priorities visible", "When several professionals support a child, tell each person which daily activities matter most to your family. Ask how their recommendations connect and who will help resolve conflicting instructions."],
        ["Share information thoughtfully", "Keep reports in one place and agree what may be shared with school or other providers. A short summary of current goals, useful adjustments and contact details can make meetings easier to follow."],
        ["Keep the child at the centre", "Ask how your child’s preferences are represented in decisions. If appointments or home activities are becoming too demanding, discuss the schedule. Coordination should help the family understand and manage support."],
      ],
      tips: ["Ask for a clear point of contact.", "Bring updated recommendations to joint discussions.", "Confirm responsibilities and the next review date."],
    },
    bn: {
      title: "শিশুর সহায়তাকারী দলের মধ্যে সমন্বয় গড়ে তুলুন",
      summary: "পরিবার, বিদ্যালয় ও বিশেষজ্ঞদের স্পষ্ট যোগাযোগ সবার কাছে একই অগ্রাধিকার পৌঁছাতে সাহায্য করে।",
      sections: [
        ["অগ্রাধিকার স্পষ্ট করুন", "একাধিক বিশেষজ্ঞ শিশুকে সহায়তা করলে পরিবারের কাছে কোন দৈনন্দিন কাজ বেশি জরুরি সবাইকে জানান। তাঁদের পরামর্শগুলো কীভাবে সম্পর্কিত এবং নির্দেশনা না মিললে কে সমাধানে সাহায্য করবেন জিজ্ঞেস করুন।"],
        ["বুঝে তথ্য ভাগ করুন", "প্রতিবেদনগুলো এক জায়গায় রাখুন। বিদ্যালয় বা অন্য সেবাদাতার সঙ্গে কী তথ্য দেওয়া যাবে ঠিক করুন। বর্তমান লক্ষ্য, সহায়ক পরিবর্তন ও যোগাযোগের তথ্যের ছোট তালিকা আলোচনা বুঝতে সাহায্য করে।"],
        ["শিশুকেই কেন্দ্রে রাখুন", "সিদ্ধান্তে শিশুর পছন্দ কীভাবে উঠে আসছে জানতে চান। সাক্ষাৎ বা বাড়ির কাজ অতিরিক্ত চাপ তৈরি করলে সময়সূচি নিয়ে আলোচনা করুন। সমন্বয়ের উদ্দেশ্য হলো পরিবারের জন্য সহায়তা বোঝা ও পরিচালনা সহজ করা।"],
      ],
      tips: ["যোগাযোগের জন্য নির্দিষ্ট ব্যক্তি কে জানুন।", "সমন্বিত আলোচনায় হালনাগাদ পরামর্শ আনুন।", "কার কী দায়িত্ব ও পরবর্তী পর্যালোচনার দিন নিশ্চিত করুন।"],
    },
  },
];
