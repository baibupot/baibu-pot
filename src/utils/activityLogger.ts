import { supabase } from '../integrations/supabase/client';

export interface ActivityLogData {
  user_id?: string;
  user_name: string;
  user_role?: string;
  action_type: 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'approve' | 'reject' | 'login' | 'logout';
  entity_type: 'news' | 'events' | 'magazine' | 'sponsors' | 'users' | 'team' | 'documents' | 'internships' | 'surveys' | 'products' | 'messages' | 'comments';
  entity_id?: string;
  entity_title?: string;
  description?: string;
  metadata?: any;
}

// Aktivite log kaydetme fonksiyonu
export const logActivity = async (logData: ActivityLogData) => {
  try {
    const { error } = await supabase
      .from('activity_logs')
      .insert([{
        ...logData,
        ip_address: '127.0.0.1', // Gerçek IP için client-side'dan alınabilir
        user_agent: navigator.userAgent
      }]);
    
    if (error) {
      console.error('Aktivite log kaydedilemedi:', error);
    }
  } catch (error) {
    console.error('Aktivite log hatası:', error);
  }
};

// Kullanıcı giriş logu
export const logUserLogin = async (userName: string, userRole?: string) => {
  await logActivity({
    user_name: userName,
    user_role: userRole,
    action_type: 'login',
    entity_type: 'users',
    description: `${userName} sisteme giriş yaptı`,
  });
};

// Kullanıcı çıkış logu
export const logUserLogout = async (userName: string, userRole?: string) => {
  await logActivity({
    user_name: userName,
    user_role: userRole,
    action_type: 'logout',
    entity_type: 'users',
    description: `${userName} sistemden çıkış yaptı`,
  });
};

// İçerik oluşturma logu
export const logContentCreate = async (
  userName: string,
  userRole: string,
  entityType: ActivityLogData['entity_type'],
  entityTitle: string,
  entityId?: string
) => {
  await logActivity({
    user_name: userName,
    user_role: userRole,
    action_type: 'create',
    entity_type: entityType,
    entity_id: entityId,
    entity_title: entityTitle,
    description: `${userName} yeni ${getEntityTypeName(entityType)} oluşturdu: ${entityTitle}`,
  });
};

// İçerik güncelleme logu
export const logContentUpdate = async (
  userName: string,
  userRole: string,
  entityType: ActivityLogData['entity_type'],
  entityTitle: string,
  entityId?: string
) => {
  await logActivity({
    user_name: userName,
    user_role: userRole,
    action_type: 'update',
    entity_type: entityType,
    entity_id: entityId,
    entity_title: entityTitle,
    description: `${userName} ${getEntityTypeName(entityType)} güncelledi: ${entityTitle}`,
  });
};

// İçerik silme logu
export const logContentDelete = async (
  userName: string,
  userRole: string,
  entityType: ActivityLogData['entity_type'],
  entityTitle: string,
  entityId?: string
) => {
  await logActivity({
    user_name: userName,
    user_role: userRole,
    action_type: 'delete',
    entity_type: entityType,
    entity_id: entityId,
    entity_title: entityTitle,
    description: `${userName} ${getEntityTypeName(entityType)} sildi: ${entityTitle}`,
  });
};

// İçerik yayınlama logu
export const logContentPublish = async (
  userName: string,
  userRole: string,
  entityType: ActivityLogData['entity_type'],
  entityTitle: string,
  entityId?: string
) => {
  await logActivity({
    user_name: userName,
    user_role: userRole,
    action_type: 'publish',
    entity_type: entityType,
    entity_id: entityId,
    entity_title: entityTitle,
    description: `${userName} ${getEntityTypeName(entityType)} yayınladı: ${entityTitle}`,
  });
};

// İçerik onaylama logu
export const logContentApprove = async (
  userName: string,
  userRole: string,
  entityType: ActivityLogData['entity_type'],
  entityTitle: string,
  entityId?: string
) => {
  await logActivity({
    user_name: userName,
    user_role: userRole,
    action_type: 'approve',
    entity_type: entityType,
    entity_id: entityId,
    entity_title: entityTitle,
    description: `${userName} ${getEntityTypeName(entityType)} onayladı: ${entityTitle}`,
  });
};

// Entity type'ları Türkçe isimlere çeviren fonksiyon
export const getEntityTypeName = (entityType: ActivityLogData['entity_type']): string => {
  const typeNames: Record<ActivityLogData['entity_type'], string> = {
    news: 'haber',
    events: 'etkinlik',
    magazine: 'dergi',
    sponsors: 'sponsor',
    users: 'kullanıcı',
    team: 'ekip',
    documents: 'belge',
    internships: 'staj',
    surveys: 'anket',
    products: 'ürün',
    messages: 'mesaj',
    comments: 'yorum'
  };
  
  return typeNames[entityType] || entityType;
};

// Action type'ları Türkçe isimlere çeviren fonksiyon
export const getActionTypeName = (actionType: ActivityLogData['action_type']): string => {
  const actionNames: Record<ActivityLogData['action_type'], string> = {
    create: 'oluşturdu',
    update: 'güncelledi',
    delete: 'sildi',
    publish: 'yayınladı',
    unpublish: 'yayından kaldırdı',
    approve: 'onayladı',
    reject: 'reddetti',
    login: 'giriş yaptı',
    logout: 'çıkış yaptı'
  };
  
  return actionNames[actionType] || actionType;
}; 