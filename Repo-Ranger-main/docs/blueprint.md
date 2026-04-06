# **App Name**: Repo Ranger

## Core Features:

- Repository Search: Search GitHub repositories based on keywords. Results display the repository name, description, stars, and last updated date.
- Repository Details: Display repository details, including the README content, installation steps (parsed from the README), and a direct link to download the repository as a ZIP file.
- Installation Guide Summarizer: AI tool to analyze the README file of a repository and summarize the installation steps for the user.
- Creator Profile Link: Display links to the creator's GitHub profile, providing a way to learn more about the developers behind the projects.
- Caching System: Cache search results and repository details in Supabase to reduce API calls and improve response times.
- App Categorization: Categorize apps using AI to make finding apps easier. A tool to determine relevant tags or categories for each repository to improve discoverability.
- Repository Health Indicators: Integrate badges or indicators that reflect the health and status of a repository, such as the date of the last commit, the number of open issues, and the license type. This can give users a quick signal as to whether the app is actively maintained and safe to use.

## Style Guidelines:

- Primary color: HSL(210, 70%, 50%) - A vibrant, deep blue (#1A82E2) evokes trust, stability, and intelligence.
- Background color: HSL(210, 20%, 95%) - Very light blue-tinted off-white (#F0F6FA) offers a clean, modern feel without being stark.
- Accent color: HSL(180, 60%, 40%) - A crisp, energetic teal (#2BB6B0) highlights important interactive elements.
- Body font: 'Inter', a sans-serif typeface, for a clean, modern and readable interface. Inter is suitable for both headlines and body text.
- Code font: 'Source Code Pro', a monospaced font for code snippets in README files
- Use simple, outlined icons from a consistent set (e.g., Feather icons) to maintain a clean and modern aesthetic. Icons should be used to enhance, not distract.
- Use a clean, card-based layout to present repository information. Each card should contain essential details and direct links to download or view more information.
- Use subtle animations for transitions and loading states to provide a smooth user experience. Avoid excessive animations that can be distracting.