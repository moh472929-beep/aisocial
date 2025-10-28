import express from "express";
import { initDB, getModel } from "../db/init.js";
import config from "../../config.js";
import axios from "axios";
import { authenticateToken  } from "../middleware/auth.js";
import { checkSubscription  } from "../middleware/checkAIPermissions.js";

const router = express.Router();

// Use shared JWT authentication middleware
router.use(authenticateToken);

// Get user subscription type
async function getUserSubscriptionType(userId) {
  const userModel = getModel('User');
  const user = await userModel.findById(userId);
  return user?.subscription || 'free';
}

// Get user location (mock implementation - in real app, this would use IP geolocation or user settings)
async function getUserLocation(userId) {
  // In a real implementation, this would detect location via IP or user settings
  // For now, we'll return a default location
  return 'US'; // Default to US, but in real app this would be dynamic
}

// Mock function to fetch trending topics from various sources
// In a real implementation, this would connect to actual APIs
async function fetchTrendingTopicsFromSources(location) {
  // This is a mock implementation - in a real app, you would connect to:
  // - Google Trends API
  // - Twitter Trending Topics API
  // - Reddit Hot/Trending posts
  // - YouTube Trending API

  // Mock data for demonstration
  const mockTopics = [
    { keyword: 'technology', title: 'Latest Technology Trends' },
    { keyword: 'ai', title: 'Artificial Intelligence Advances' },
    { keyword: 'climate', title: 'Climate Change Updates' },
    { keyword: 'sports', title: 'Sports News' },
    { keyword: 'entertainment', title: 'Entertainment Industry' },
  ];

  return mockTopics.map(topic => ({
    topic_keyword: topic.keyword,
    topic_title: topic.title,
    location: location,
    status: 'discovered',
    first_discovered_at: new Date(),
  }));
}

// Obfuscate topic for free users
function obfuscateTopic(topic) {
  return {
    ...topic,
    topic_keyword: '***',
    topic_title: '********',
    content_preview: '***',
  };
}

// Generate AI content for a topic (mock implementation)
async function generateAIContent(topic, userPreferences = {}) {
  // In a real implementation, this would use OpenAI or another AI service
  // For now, we'll return mock content

  const mockContent = `Professional content about ${topic.topic_title} relevant to ${topic.location}. 
    This is AI-generated content that provides valuable insights on the trending topic. 
    The content is tailored to engage users and provide actionable information.`;

  return {
    content: mockContent,
    content_id: `content_${Date.now()}`,
    generated_at: new Date(),
  };
}

// Fetch trending topics from free sources for location
router.get('/fetch', async (req, res) => {
  try {
    const userId = req.user.userId;
    const location = await getUserLocation(userId);
    const subscriptionType = await getUserSubscriptionType(userId);

    // Fetch trending topics from various sources
    const trendingTopics = await fetchTrendingTopicsFromSources(location);

    // Filter out topics that already exist for this user
    const trendingTopicModel = getModel('TrendingTopic');
    const filteredTopics = [];

    for (const topic of trendingTopics) {
      const existingTopic = await trendingTopicModel.findByUserIdAndKeyword(
        userId,
        topic.topic_keyword
      );
      if (!existingTopic) {
        // Add subscription type and store in database
        const topicWithSubscription = {
          ...topic,
          user_id: userId,
          subscription_type: subscriptionType,
          location: location,
        };

        // Save to database
        await trendingTopicModel.create(topicWithSubscription);
        filteredTopics.push(topicWithSubscription);
      }
    }

    res.json({
      success: true,
      topics: filteredTopics,
      location: location,
      subscriptionType: subscriptionType,
      message: {
        en: 'Trending topics fetched successfully',
        ar: 'تم جلب المواضيع الشائعة بنجاح',
        fr: 'Sujets tendance récupérés avec succès',
        de: 'Trendthemen erfolgreich abgerufen',
        es: 'Temas de tendencia obtenidos con éxito',
      },
    });
  } catch (error) {
    console.error('Fetch trending topics error:', error);
    res.status(500).json({
      success: false,
      error: {
        en: 'Server error while fetching trending topics',
        ar: 'خطأ في الخادم أثناء جلب المواضيع الشائعة',
        fr: 'Erreur serveur lors de la récupération des sujets tendance',
        de: 'Serverfehler beim Abrufen von Trendthemen',
        es: 'Error del servidor al obtener temas de tendencia',
      },
    });
  }
});

// AI generates professional content per topic
router.post('/generate', checkSubscription('premium'), async (req, res) => {
  try {
    const userId = req.user.userId;
    const { topicId } = req.body;
    const subscriptionType = await getUserSubscriptionType(userId);

    // Only premium and VIP users can generate AI content
    if (subscriptionType === 'free') {
      return res.status(403).json({
        success: false,
        error: {
          en: 'AI content generation is only available for premium users',
          ar: 'توليد محتوى AI متاح فقط للمستخدمين المميزين',
          fr: 'La génération de contenu IA est disponible uniquement pour les utilisateurs premium',
          de: 'KI-Inhaltserstellung ist nur für Premium-Nutzer verfügbar',
          es: 'La generación de contenido de IA solo está disponible para usuarios premium',
        },
      });
    }

    const trendingTopicModel = getModel('TrendingTopic');
    // In a real implementation, you would fetch the topic by ID
    // For this mock, we'll simulate finding a topic

    // Generate AI content
    const aiContent = await generateAIContent({
      topic_title: 'Sample Topic',
      location: await getUserLocation(userId),
    });

    // Update topic status and content ID
    // In a real implementation, you would update the specific topic by ID
    // await trendingTopicModel.updateContentId(topicId, aiContent.content_id);
    // await trendingTopicModel.updateStatus(topicId, 'generated');

    res.json({
      success: true,
      content: aiContent,
      message: {
        en: 'AI content generated successfully',
        ar: 'تم توليد محتوى AI بنجاح',
        fr: 'Contenu IA généré avec succès',
        de: 'KI-Inhalt erfolgreich generiert',
        es: 'Contenido de IA generado con éxito',
      },
    });
  } catch (error) {
    console.error('Generate AI content error:', error);
    res.status(500).json({
      success: false,
      error: {
        en: 'Server error while generating AI content',
        ar: 'خطأ في الخادم أثناء توليد محتوى AI',
        fr: 'Erreur serveur lors de la génération de contenu IA',
        de: 'Serverfehler bei der KI-Inhaltsgenerierung',
        es: 'Error del servidor al generar contenido de IA',
      },
    });
  }
});

// Publish automatically or prepare for review
router.post('/publish', checkSubscription('premium'), async (req, res) => {
  try {
    const userId = req.user.userId;
    const { topicId } = req.body;
    const subscriptionType = await getUserSubscriptionType(userId);

    // Update topic status to published or reviewed based on subscription
    const status = subscriptionType === 'vip' ? 'published' : 'reviewed';

    // In a real implementation, you would update the specific topic by ID
    // const trendingTopicModel = getModel('TrendingTopic');
    // await trendingTopicModel.updateStatus(topicId, status);

    res.json({
      success: true,
      status: status,
      message: {
        en: `Topic ${status} successfully`,
        ar: `تم ${status === 'published' ? 'نشر' : 'مراجعة'} الموضوع بنجاح`,
        fr: `Sujet ${status === 'published' ? 'publié' : 'révisé'} avec succès`,
        de: `Thema erfolgreich ${status === 'published' ? 'veröffentlicht' : 'überprüft'}`,
        es: `Tema ${status === 'published' ? 'publicado' : 'revisado'} con éxito`,
      },
    });
  } catch (error) {
    console.error('Publish topic error:', error);
    res.status(500).json({
      success: false,
      error: {
        en: 'Server error while publishing topic',
        ar: 'خطأ في الخادم أثناء نشر الموضوع',
        fr: 'Erreur serveur lors de la publication du sujet',
        de: 'Serverfehler beim Veröffentlichen des Themas',
        es: 'Error del servidor al publicar el tema',
      },
    });
  }
});

// Return topics list to frontend (obfuscate if Free user)
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const subscriptionType = await getUserSubscriptionType(userId);

    const trendingTopicModel = getModel('TrendingTopic');
    const topics = await trendingTopicModel.findByUserId(userId);

    // Obfuscate topics for free users
    const processedTopics = subscriptionType === 'free' ? topics.map(obfuscateTopic) : topics;

    res.json({
      success: true,
      topics: processedTopics,
      subscriptionType: subscriptionType,
      lastUpdated: new Date(),
      message: {
        en: 'Trending topics retrieved successfully',
        ar: 'تم استرجاع المواضيع الشائعة بنجاح',
        fr: 'Sujets tendance récupérés avec succès',
        de: 'Trendthemen erfolgreich abgerufen',
        es: 'Temas de tendencia recuperados con éxito',
      },
    });
  } catch (error) {
    console.error('List trending topics error:', error);
    res.status(500).json({
      success: false,
      error: {
        en: 'Server error while retrieving trending topics',
        ar: 'خطأ في الخادم أثناء استرجاع المواضيع الشائعة',
        fr: 'Erreur serveur lors de la récupération des sujets tendance',
        de: 'Serverfehler beim Abrufen von Trendthemen',
        es: 'Error del servidor al recuperar temas de tendencia',
      },
    });
  }
});

export default router;
