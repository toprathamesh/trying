import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export interface SceneElement {
  searchQuery: string;
  name: string;
  description: string;
  position: { x: number; y: number; z: number };
  scale: number;
  rotation?: number; // Y-axis rotation in degrees
}

export interface SceneComposition {
  title: string;
  description: string;
  elements: SceneElement[];
  cameraPosition: { x: number; y: number; z: number };
  ambiance: 'bright' | 'dim' | 'dramatic' | 'natural';
}

export interface ObjectAnnotation {
  title: string;
  explanation: string;
  funFact: string;
  relatedTopics: string[];
}

export class GeminiService {
  private model: GenerativeModel;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Using Gemini 2.0 Flash - latest and fastest model
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  /**
   * Analyzes user query and generates a scene composition with multiple 3D elements
   */
  async composeScene(userQuery: string): Promise<SceneComposition> {
    const prompt = `You are a 3D scene composer for an educational platform. Given a user's question or topic, you must create an explorable 3D scene using available 3D model assets.

AVAILABLE MODEL CATEGORIES (search these on Poly Pizza - a CC0 3D model library):
- Animals: dog, cat, bird, fish, horse, elephant, lion, bear, deer, rabbit, snake, frog, bee, butterfly, eagle, owl, penguin, shark, whale, dolphin, turtle, crab, octopus
- Nature: tree, flower, plant, rock, mountain, grass, mushroom, cactus, palm tree, pine tree, bush, log, leaf
- Buildings: house, castle, tower, church, barn, tent, lighthouse, windmill, bridge, gate, fence, wall
- Vehicles: car, truck, bus, airplane, helicopter, boat, ship, bicycle, motorcycle, train, rocket
- Food: apple, banana, orange, bread, cake, pizza, burger, ice cream, donut, cookie, watermelon, carrot, corn
- Objects: chair, table, lamp, book, clock, phone, computer, tv, camera, guitar, piano, drum, ball, sword, shield, crown, treasure chest, key, lantern, candle
- Science: microscope, telescope, globe, atom, crystal, magnet, beaker, test tube
- Fantasy: dragon, unicorn, fairy, wizard, knight, goblin, treasure
- Sports: soccer ball, basketball, tennis racket, golf club, skateboard, surfboard

USER QUERY: "${userQuery}"

RESPOND WITH VALID JSON ONLY (no markdown, no backticks):
{
  "title": "Scene title",
  "description": "Educational description of what's being shown (2-3 sentences)",
  "elements": [
    {
      "searchQuery": "exact search term for Poly Pizza (simple, 1-2 words)",
      "name": "Display name for this element",
      "description": "Brief educational description",
      "position": { "x": 0, "y": 0, "z": 5 },
      "scale": 1.0,
      "rotation": 0
    }
  ],
  "cameraPosition": { "x": 0, "y": 1.6, "z": -5 },
  "ambiance": "natural"
}

POSITIONING RULES:
- Center main subject at (0, 0, 5)
- Y is up: ground level is 0, objects sit ON the ground
- Spread elements naturally, like a museum exhibit or diorama
- Use x from -15 to 15, z from 0 to 30 for variety
- Scale: 1.0 = normal (about 1-2 meters), adjust based on real-world proportions
- Face objects toward camera start position when relevant

IMPORTANT:
- Create 1-5 elements maximum for performance
- Search queries should be SIMPLE words that will find 3D models
- Be educational but visually interesting
- Think like a museum curator or science exhibit designer`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      
      // Clean the response - remove markdown if present
      const cleaned = text
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      const composition: SceneComposition = JSON.parse(cleaned);
      
      // Validate and set defaults
      composition.elements = composition.elements.map(el => ({
        ...el,
        position: el.position || { x: 0, y: 0, z: 5 },
        scale: el.scale || 1.0,
        rotation: el.rotation || 0
      }));
      
      return composition;
    } catch (error) {
      console.error('Gemini scene composition failed:', error);
      // Fallback to simple single-object scene
      return {
        title: userQuery,
        description: `Exploring: ${userQuery}`,
        elements: [{
          searchQuery: userQuery.split(' ')[0].toLowerCase(),
          name: userQuery,
          description: 'An object to explore',
          position: { x: 0, y: 0, z: 5 },
          scale: 1.0
        }],
        cameraPosition: { x: 0, y: 1.6, z: -3 },
        ambiance: 'natural'
      };
    }
  }

  /**
   * Generates educational annotation for a clicked object
   */
  async annotateObject(
    objectName: string, 
    sceneContext: string,
    userLevel: 'child' | 'teen' | 'adult' = 'teen'
  ): Promise<ObjectAnnotation> {
    const levelGuide = {
      child: 'Explain like talking to a curious 8 year old. Use simple words and fun comparisons.',
      teen: 'Explain clearly for a middle/high school student. Be engaging and informative.',
      adult: 'Explain with detail appropriate for a college student or adult learner.'
    };

    const prompt = `You are an educational AI assistant explaining objects in a 3D learning environment.

OBJECT CLICKED: "${objectName}"
SCENE CONTEXT: "${sceneContext}"
EXPLANATION LEVEL: ${levelGuide[userLevel]}

Generate an educational annotation. RESPOND WITH VALID JSON ONLY:
{
  "title": "Catchy 3-5 word title",
  "explanation": "1-2 sentence educational explanation",
  "funFact": "One surprising or interesting fact",
  "relatedTopics": ["topic1", "topic2", "topic3"]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Gemini annotation failed:', error);
      return {
        title: objectName,
        explanation: 'This is an interesting object to explore.',
        funFact: 'Every object has a story to tell!',
        relatedTopics: ['exploration', 'learning', 'discovery']
      };
    }
  }

  /**
   * Suggests related queries based on what the user is exploring
   */
  async suggestRelated(currentQuery: string): Promise<string[]> {
    const prompt = `Given the educational topic "${currentQuery}", suggest 4 related 3D-explorable topics.
Return as a JSON array of strings only: ["topic1", "topic2", "topic3", "topic4"]`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Gemini suggestions failed:', error);
      return [];
    }
  }
}

