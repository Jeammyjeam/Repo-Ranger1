'use server';

import { searchRepositories } from './github';

const popularLanguages = ['JavaScript', 'Python', 'Java', 'TypeScript', 'C#', 'C++', 'PHP', 'Go', 'Rust', 'Swift', 'Kotlin', 'Ruby'];

// Simple Fisher-Yates shuffle
function shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export async function getRandomRepository(): Promise<{ owner: string, repo: string } | null> {
    try {
        const shuffledLangs = shuffle([...popularLanguages]);
        
        // Try up to 3 random languages to find a suitable repo
        for (let i = 0; i < 3; i++) {
            const language = shuffledLangs[i];
            const pushedDate = new Date();
            pushedDate.setFullYear(pushedDate.getFullYear() - 1);
            
            const query = `language:${language} stars:>1000 pushed:>${pushedDate.toISOString().split('T')[0]}`;
            
            const results = await searchRepositories(query, 'stars', 'desc');
            
            if (results && results.length > 0) {
                const randomRepo = results[Math.floor(Math.random() * results.length)];
                return {
                    owner: randomRepo.owner.login,
                    repo: randomRepo.name,
                };
            }
        }
        return null;

    } catch (error) {
        console.error("Failed to get random repository:", error);
        return null;
    }
}
