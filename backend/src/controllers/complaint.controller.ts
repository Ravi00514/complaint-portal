import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import { GoogleGenAI } from '@google/genai';

export const createComplaint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      categoryId, 
      departmentId, 
      categoryName, 
      departmentName, 
      officeName, 
      userId, 
      userName, 
      userPhone, 
      priority, 
      location, 
      description 
    } = req.body;

    if (!categoryId || !departmentId || !userId || !description) {
      return next(new AppError('Missing required complaint details.', 400));
    }

    const insertResult = await query(
      `INSERT INTO complaints (
        category_id, department_id, category_name, department_name, office_name,
        user_id, user_name, user_phone, status, priority, location, description, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        categoryId, departmentId, categoryName, departmentName, officeName,
        userId, userName, userPhone, 'Open', priority || 'Medium', location, description, new Date()
      ]
    );

    const newComplaint = insertResult.rows[0];

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      data: {
        id: newComplaint.id,
        categoryId: newComplaint.category_id,
        departmentId: newComplaint.department_id,
        categoryName: newComplaint.category_name,
        departmentName: newComplaint.department_name,
        officeName: newComplaint.office_name,
        userId: newComplaint.user_id,
        userName: newComplaint.user_name,
        userPhone: newComplaint.user_phone,
        status: newComplaint.status,
        priority: newComplaint.priority,
        location: newComplaint.location,
        description: newComplaint.description,
        createdAt: newComplaint.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserComplaints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || req.query.userId;
    
    if (!userId) {
       return next(new AppError('User ID required.', 400));
    }

    const result = await query('SELECT * FROM complaints WHERE user_id = $1 ORDER BY created_at DESC', [userId]);

    const mapped = result.rows.map((c: any) => ({
        id: c.id,
        categoryId: c.category_id,
        departmentId: c.department_id,
        categoryName: c.category_name,
        departmentName: c.department_name,
        officeName: c.office_name,
        userId: c.user_id,
        userName: c.user_name,
        userPhone: c.user_phone,
        status: c.status,
        priority: c.priority,
        location: c.location,
        description: c.description,
        adminReply: c.admin_reply,
        repliedAt: c.replied_at,
        createdAt: c.created_at
    }));

    res.status(200).json({
      success: true,
      data: mapped
    });
  } catch (error) {
    next(error);
  }
};

export const getAllComplaints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query('SELECT * FROM complaints ORDER BY created_at DESC');
    const mapped = result.rows.map((c: any) => ({
      id: c.id,
      categoryId: c.category_id,
      departmentId: c.department_id,
      categoryName: c.category_name,
      departmentName: c.department_name,
      officeName: c.office_name,
      userId: c.user_id,
      userName: c.user_name,
      userPhone: c.user_phone,
      status: c.status,
      priority: c.priority,
      location: c.location,
      description: c.description,
      adminReply: c.admin_reply,
      repliedAt: c.replied_at,
      createdAt: c.created_at
    }));

    res.status(200).json({
      success: true,
      data: mapped
    });
  } catch (error) {
    next(error);
  }
};

export const replyComplaint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reply, status } = req.body;
    if (!reply) {
      return next(new AppError('Reply message is required.', 400));
    }

    const updatedStatus = status || 'In Progress';
    const result = await query(
      'UPDATE complaints SET admin_reply = $1, status = $2, replied_at = NOW() WHERE id = $3 RETURNING *',
      [reply, updatedStatus, id]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Complaint not found.', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Official reply sent to citizen successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const updateComplaintStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return next(new AppError('Status is required.', 400));
    }

    const result = await query('UPDATE complaints SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    if (result.rows.length === 0) {
      return next(new AppError('Complaint not found.', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const parseComplaintAI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transcript, language = 'en-IN', history = [] } = req.body;
    if (!transcript) {
      return next(new AppError('No transcript provided.', 400));
    }

    const langCode = (language || 'en-IN').split('-')[0].toLowerCase();
    const apiKey = process.env.AI_API_KEY;

    // Helper for Rule-Based AI Parser
    const runRuleBasedParser = () => {
      // Remove language words like 'English', 'Telugu', 'Hindi' if they prefix the transcript
      const cleaned = transcript
        .replace(/^(english|telugu|hindi|తెలుగు|हिंदी)[\s.,;:]*/i, '')
        .trim();
      const activeText = cleaned.length > 0 ? cleaned : transcript;
      const lower = activeText.toLowerCase();
      
      // Determine category with keyword matching and priority
      let category = "General";
      if (lower.includes("drainage") || lower.includes("sewer") || lower.includes("sewage") || lower.includes("gutter") || lower.includes("manhole") || lower.includes("overflow") || lower.includes("డ్రైనేజీ") || lower.includes("కాలువ") || lower.includes("మురుగు") || lower.includes("నాళం") || lower.includes("नाली") || lower.includes("सीवर")) {
        category = "Drainage";
      } else if (lower.includes("light") || lower.includes("lamp") || lower.includes("bulb") || lower.includes("pole") || lower.includes("street light") || lower.includes("దీపం") || lower.includes("లైట్") || lower.includes("బల్బ్") || lower.includes("లైట్లు") || lower.includes("लाइट") || lower.includes("बल्ब")) {
        category = "Street Light";
      } else if (lower.includes("water") || lower.includes("pipe") || lower.includes("tap") || lower.includes("leak") || lower.includes("నీరు") || lower.includes("నీళ్లు") || lower.includes("మంచినీరు") || lower.includes("పైప్") || lower.includes("पानी") || lower.includes("नल")) {
        category = "Water Supply";
      } else if (lower.includes("power") || lower.includes("electricity") || lower.includes("current") || lower.includes("voltage") || lower.includes("wire") || lower.includes("విద్యుత్") || lower.includes("కరెంట్") || lower.includes("తీగ") || lower.includes("बिजली") || lower.includes("करंट")) {
        category = "Power Cut";
      } else if (lower.includes("road") || lower.includes("pothole") || lower.includes("footpath") || lower.includes("tar") || lower.includes("రోడ్డు") || lower.includes("గుంత") || lower.includes("గుంతలు") || lower.includes("सड़क") || lower.includes("गड्ढे")) {
        category = "Road Damage";
      } else if (lower.includes("garbage") || lower.includes("trash") || lower.includes("waste") || lower.includes("dustbin") || lower.includes("dump") || lower.includes("చెత్త") || lower.includes("కచరా") || lower.includes("कचरा") || lower.includes("कूड़ा")) {
        category = "Garbage Collection";
      } else if (lower.includes("tree") || lower.includes("branch") || lower.includes("చెట్టు") || lower.includes("కొమ్మ") || lower.includes("पेड़")) {
        category = "Tree Fallen";
      } else if (lower.includes("signal") || lower.includes("traffic") || lower.includes("ట్రాఫిక్") || lower.includes("సిగ్నల్") || lower.includes("ट्रैफिक")) {
        category = "Traffic Signal";
      } else if (lower.includes("dog") || lower.includes("animal") || lower.includes("cattle") || lower.includes("కుక్క") || lower.includes("జంతువు") || lower.includes("कुत्ता") || lower.includes("जानवर")) {
        category = "Animal Issue";
      } else if (lower.includes("police") || lower.includes("theft") || lower.includes("crime") || lower.includes("దొంగతనం") || lower.includes("పోలీస్") || lower.includes("पुलिस") || lower.includes("चोरी")) {
        category = "Police";
      } else if (lower.includes("fire") || lower.includes("smoke") || lower.includes("మంటలు") || lower.includes("నిప్పు") || lower.includes("ఆగ") || lower.includes("धुआं")) {
        category = "Fire";
      } else if (lower.includes("hospital") || lower.includes("doctor") || lower.includes("health") || lower.includes("ఆసుపత్రి") || lower.includes("వైద్యం") || lower.includes("अस्पताल")) {
        category = "Hospital";
      } else if (lower.includes("gas") || lower.includes("lpg") || lower.includes("గ్యాస్") || lower.includes("गैस")) {
        category = "Gas Leakage";
      } else if (lower.includes("bus") || lower.includes("transport") || lower.includes("బస్సు") || lower.includes("बस")) {
        category = "Public Transport";
      }

      // Detect location keywords
      let location = "";
      const locMatch = activeText.match(/(?:at|in|near|around|location|street|colony|nagar|road|ward|lane|circle|bazar|అక్కడ|లో|మా|వద్ద|में|के पास)\s+([A-Za-z0-9\s‌-]{2,30})/i);
      if (locMatch && locMatch[1]) {
        location = locMatch[1].trim();
      }

      // Priority
      let priority = "Medium";
      if (lower.includes("urgent") || lower.includes("danger") || lower.includes("emergency") || lower.includes("overflow") || lower.includes("burst") || lower.includes("hazard") || lower.includes("అత్యవసరం") || lower.includes("ప్రమాదం") || lower.includes("ఆపద") || lower.includes("आपातकालीन") || lower.includes("खतरा")) {
        priority = "High";
      }

      // Mark complete if category identified or length is informative
      const hasRecognizedCategory = category !== "General";
      const isComplete = hasRecognizedCategory || activeText.length > 8 || location.length > 0;

      let nextQuestion = "";
      let summary = "";

      if (!isComplete) {
        if (langCode === 'te') {
          nextQuestion = "సమస్య ఏమిటి మరియు ఎక్కడ ఉందో దయచేసి వివరంగా చెప్పగలరా?";
        } else if (langCode === 'hi') {
          nextQuestion = "कृपया बताएं कि क्या समस्या है और वह कहाँ पर है?";
        } else {
          nextQuestion = "Could you please specify what problem you are facing or where it is located?";
        }
      } else {
        const titleStr = category !== "General" ? `${category} Grievance` : "Public Grievance";
        const locDisplay = location || "Local Ward Area";
        if (langCode === 'te') {
          summary = `నేను మీ ఫిర్యాదును అర్థం చేసుకున్నాను. విభాగం: ${category}, శీర్షిక: ${titleStr}, సమస్య: ${activeText}. స్థానం: ${locDisplay}. నేను ఈ ఫిర్యాదును సమర్పించవచ్చా?`;
        } else if (langCode === 'hi') {
          summary = `मैंने आपकी शिकायत समझ ली है। विभाग: ${category}, शीर्षक: ${titleStr}, विवरण: ${activeText}। स्थान: ${locDisplay}। क्या मैं इसे दर्ज करूँ?`;
        } else {
          summary = `I have understood your complaint. Category: ${category}, Title: ${titleStr}, Description: ${activeText}. Location: ${locDisplay}. Priority: ${priority}. Should I submit this complaint?`;
        }
      }

      return {
        title: category !== "General" ? `${category} Grievance` : "Public Complaint",
        description: activeText,
        category,
        location: location || "Local Area",
        priority,
        isComplete,
        nextQuestion,
        summary
      };
    };

    if (!apiKey) {
      console.log('[AI Voice] Processing with rule-based NLP parser engine.');
      return res.status(200).json({
        success: true,
        data: runRuleBasedParser()
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
You are an AI assistant for a Civic Services Portal (CSP).
The user is speaking in ${langCode === 'te' ? 'Telugu' : langCode === 'hi' ? 'Hindi' : 'English'}.
User transcript: "${transcript}"

Extract complaint details and respond in valid JSON with these exact fields:
- title: Short title (in English)
- description: Detailed description (in English)
- category: One of ["Electricity", "Street Lighting", "Garbage Collection", "Road Damage", "Water Leakage", "Drainage", "Tree Fallen", "Traffic Signal", "Police", "Fire", "Hospital", "Gas Leakage", "Internet", "Animal Issue", "Public Transport", "Sewage", "Water Supply", "Municipality", "General"]
- location: Mentioned location (string)
- priority: "Low", "Medium", "High", or "Critical"
- isComplete: boolean (true if transcript contains enough detail about problem + location)
- nextQuestion: follow-up question asking for missing info in ${langCode === 'te' ? 'Telugu' : langCode === 'hi' ? 'Hindi' : 'English'} (or empty string if complete)
- summary: brief clear verbal summary asking for user confirmation in ${langCode === 'te' ? 'Telugu' : langCode === 'hi' ? 'Hindi' : 'English'} (or empty string if incomplete)
`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const text = response.text;
      const data = JSON.parse(text || '{}');

      return res.status(200).json({
        success: true,
        data
      });
    } catch (apiErr) {
      console.warn('[AI API Warning] Gemini API unavailable or timed out, falling back to rule-based NLP parser:', apiErr);
      return res.status(200).json({
        success: true,
        data: runRuleBasedParser()
      });
    }
  } catch (error) {
    console.error('AI parsing error:', error);
    next(new AppError('Failed to parse complaint with AI.', 500));
  }
};

export const getTTSAudio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const text = (req.query.text as string) || 'Hello';
    const lang = (req.query.lang as string) || 'en-IN';
    const langCode = lang.split('-')[0].toLowerCase(); // 'en', 'te', 'hi'

    console.log(`[VOICE] TTS request received on backend for text: "${text.slice(0, 40)}..." | Lang: ${langCode}`);

    const urls = [
      `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.slice(0, 300))}&tl=${langCode}&client=tw-ob`,
      `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.slice(0, 300))}&tl=${langCode}&client=gtx`
    ];

    let audioBuffer: Buffer | null = null;

    for (const ttsUrl of urls) {
      try {
        const response = await fetch(ttsUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          audioBuffer = Buffer.from(arrayBuffer);
          console.log(`[VOICE] Audio data received from TTS engine. Size: ${audioBuffer.length} bytes`);
          break;
        }
      } catch (err) {
        console.warn(`[VOICE ERROR] Failed fetching from ${ttsUrl}`, err);
      }
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      console.error('[VOICE ERROR] Audio creation failed across all mirrors.');
      return next(new AppError('Failed to generate TTS audio stream.', 500));
    }

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length.toString(),
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400'
    });

    console.log('[VOICE] Sending audio stream to client');
    res.send(audioBuffer);
  } catch (error) {
    console.error('[VOICE ERROR] TTS Audio stream failed:', error);
    next(new AppError('TTS Audio stream error.', 500));
  }
};
