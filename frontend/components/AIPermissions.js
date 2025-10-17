import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

const AIPermissions = () => {
  const { t } = useTranslation();
  const [permissions, setPermissions] = useState({
    enabled: false,
    permissions: {
      fullAccess: false,
      autoPosting: false,
      trendPostCreation: false,
      analyticsAccess: false,
      interactionAccess: false,
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Simulate fetching current permissions
  useEffect(() => {
    // In a real implementation, this would fetch from your backend API
    const fetchPermissions = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        setTimeout(() => {
          setPermissions({
            enabled: true,
            permissions: {
              fullAccess: false,
              autoPosting: false,
              trendPostCreation: false,
              analyticsAccess: false,
              interactionAccess: false,
            }
          });
          setIsLoading(false);
        }, 500);
      } catch (err) {
        setError(t('Failed to load AI permissions'));
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [t]);

  const handlePermissionChange = (permissionName) => {
    setPermissions(prev => {
      const newPermissions = {
        ...prev,
        permissions: {
          ...prev.permissions,
          [permissionName]: !prev.permissions[permissionName]
        }
      };
      
      // If fullAccess is enabled, enable all other permissions
      if (permissionName === 'fullAccess' && newPermissions.permissions.fullAccess) {
        Object.keys(newPermissions.permissions).forEach(key => {
          if (key !== 'fullAccess') {
            newPermissions.permissions[key] = true;
          }
        });
      }
      // If any permission is disabled and fullAccess was enabled, disable fullAccess
      else if (permissionName !== 'fullAccess' && !newPermissions.permissions[permissionName] && newPermissions.permissions.fullAccess) {
        newPermissions.permissions.fullAccess = false;
      }
      // If all individual permissions are enabled, enable fullAccess
      else if (permissionName !== 'fullAccess' && newPermissions.permissions[permissionName]) {
        const allEnabled = Object.keys(newPermissions.permissions)
          .filter(key => key !== 'fullAccess')
          .every(key => newPermissions.permissions[key] === true);
        newPermissions.permissions.fullAccess = allEnabled;
      }
      
      return newPermissions;
    });
  };

  const handleSavePermissions = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // In a real implementation, this would save to your backend API
      // Example API call:
      /*
      const response = await fetch('/api/ai/permissions/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ permissions: permissions.permissions })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update permissions');
      }
      */
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(t('Permissions updated successfully'));
    } catch (err) {
      setError(t('Failed to update permissions'));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAI = async (enable) => {
    setIsLoading(true);
    setError('');
    
    try {
      // In a real implementation, this would call your backend API
      // Example API call:
      /*
      const response = await fetch(`/api/ai/permissions/${enable ? 'enable' : 'disable'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${enable ? 'enable' : 'disable'} AI`);
      }
      */
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPermissions(prev => ({
        ...prev,
        enabled: enable
      }));
      
      alert(t(`AI ${enable ? 'enabled' : 'disabled'} successfully`));
    } catch (err) {
      setError(t(`Failed to ${enable ? 'enable' : 'disable'} AI`));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !permissions.enabled) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>{t('aiPermissions')}</h2>
      
      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <button
          onClick={() => toggleAI(true)}
          disabled={isLoading || permissions.enabled}
          style={{
            padding: '10px 20px',
            backgroundColor: permissions.enabled ? '#4caf50' : '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading || permissions.enabled ? 'not-allowed' : 'pointer',
            opacity: isLoading || permissions.enabled ? 0.7 : 1
          }}
        >
          {t('enableAi')}
        </button>
        
        <button
          onClick={() => toggleAI(false)}
          disabled={isLoading || !permissions.enabled}
          style={{
            padding: '10px 20px',
            backgroundColor: !permissions.enabled ? '#f44336' : '#9e9e9e',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading || !permissions.enabled ? 'not-allowed' : 'pointer',
            opacity: isLoading || !permissions.enabled ? 0.7 : 1
          }}
        >
          {t('disableAi')}
        </button>
      </div>
      
      {permissions.enabled && (
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '8px' 
        }}>
          <h3 style={{ marginBottom: '20px' }}>{t('AI Permissions Panel')}</h3>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            {/* Full Access Permission */}
            <PermissionItem
              label={t('aiFullAccess')}
              description={t('Full access to all AI features')}
              checked={permissions.permissions.fullAccess}
              onChange={() => handlePermissionChange('fullAccess')}
            />
            
            {/* Auto-Posting Access */}
            <PermissionItem
              label={t('Auto-Posting Access')}
              description={t('Allow the AI to automatically publish user-created posts that are already in the queue or drafts')}
              checked={permissions.permissions.autoPosting}
              onChange={() => handlePermissionChange('autoPosting')}
            />
            
            {/* Trend-Based Post Creation */}
            <PermissionItem
              label={t('Trend-Based Post Creation')}
              description={t('Allow the AI to detect trending topics and automatically generate posts related to these topics')}
              checked={permissions.permissions.trendPostCreation}
              onChange={() => handlePermissionChange('trendPostCreation')}
            />
            
            {/* Analytics Access */}
            <PermissionItem
              label={t('Analytics Access')}
              description={t('Allow AI to access and analyze post performance data to improve automated decisions')}
              checked={permissions.permissions.analyticsAccess}
              onChange={() => handlePermissionChange('analyticsAccess')}
            />
            
            {/* Comment & Interaction Mode */}
            <PermissionItem
              label={t('Comment & Interaction Mode')}
              description={t('Prepare the structure for allowing AI to engage (like, comment, reply) when activated')}
              checked={permissions.permissions.interactionAccess}
              onChange={() => handlePermissionChange('interactionAccess')}
            />
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: '30px' 
          }}>
            <button
              onClick={handleSavePermissions}
              disabled={isLoading}
              style={{
                padding: '12px 30px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? t('saving') : t('save')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PermissionItem = ({ label, description, checked, onChange }) => {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'flex-start',
      padding: '15px',
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #ddd',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ 
          marginTop: '4px',
          marginLeft: '0',
          marginRight: '15px',
          transform: 'scale(1.2)'
        }}
      />
      <div>
        <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>{label}</div>
        {description && (
          <div style={{ 
            fontSize: '14px', 
            color: '#666', 
            lineHeight: '1.4'
          }}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPermissions;