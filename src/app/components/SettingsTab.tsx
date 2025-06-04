'use client';

import { useState } from 'react';

interface SettingsTabProps {
  users: any[];
}

export default function SettingsTab({ users }: SettingsTabProps) {
  const [settings, setSettings] = useState({
    platform: {
      siteName: 'Trading Journal Pro',
      siteDescription: 'Professional Trading Journal Platform',
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: true,
      maxUsersPerAccount: 5,
      sessionTimeout: 30,
      maxFileSize: 10
    },
    security: {
      passwordMinLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true,
      twoFactorAuth: false,
      loginAttempts: 5,
      lockoutDuration: 15,
      ipWhitelist: '',
      apiRateLimit: 100
    },
    notifications: {
      emailNotifications: true,
      tradeAlerts: true,
      systemAlerts: true,
      marketingEmails: false,
      weeklyReports: true,
      maintenanceNotices: true
    },
    trading: {
      defaultLeverage: 100,
      maxLeverage: 500,
      minTradeSize: 0.01,
      maxTradeSize: 100,
      allowedSymbols: 'EUR/USD,GBP/USD,USD/JPY,AUD/USD,USD/CAD',
      tradingHours: '24/7',
      weekendTrading: false
    }
  });

  const [activeSection, setActiveSection] = useState('platform');
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = () => {
    // Simulate saving settings
    console.log('Saving settings:', settings);
    setHasChanges(false);
    // Show success message
  };

  const sections = [
    { id: 'platform', name: 'Platform Settings', icon: '🏢' },
    { id: 'security', name: 'Security & Access', icon: '🔒' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'trading', name: 'Trading Settings', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ) }
  ];

  return (
    <div className="space-y-8">
      {/* Settings Navigation */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-2">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                activeSection === section.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
            >
              <span className="text-lg">{section.icon}</span>
              <span>{section.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-8">
        {/* Platform Settings */}
        {activeSection === 'platform' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <span className="text-2xl mr-2">🏢</span>
              Platform Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Site Name</label>
                <input
                  type="text"
                  value={settings.platform.siteName}
                  onChange={(e) => handleSettingChange('platform', 'siteName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Users Per Account</label>
                <input
                  type="number"
                  value={settings.platform.maxUsersPerAccount}
                  onChange={(e) => handleSettingChange('platform', 'maxUsersPerAccount', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Site Description</label>
                <textarea
                  value={settings.platform.siteDescription}
                  onChange={(e) => handleSettingChange('platform', 'siteDescription', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={settings.platform.sessionTimeout}
                  onChange={(e) => handleSettingChange('platform', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max File Size (MB)</label>
                <input
                  type="number"
                  value={settings.platform.maxFileSize}
                  onChange={(e) => handleSettingChange('platform', 'maxFileSize', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Maintenance Mode</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Temporarily disable access for maintenance</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.platform.maintenanceMode}
                    onChange={(e) => handleSettingChange('platform', 'maintenanceMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Registration Enabled</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Allow new user registrations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.platform.registrationEnabled}
                    onChange={(e) => handleSettingChange('platform', 'registrationEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Email Verification Required</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Require email verification for new accounts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.platform.emailVerificationRequired}
                    onChange={(e) => handleSettingChange('platform', 'emailVerificationRequired', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeSection === 'security' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <span className="text-2xl mr-2">🔒</span>
              Security & Access Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password Min Length</label>
                <input
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Login Attempts</label>
                <input
                  type="number"
                  value={settings.security.loginAttempts}
                  onChange={(e) => handleSettingChange('security', 'loginAttempts', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lockout Duration (minutes)</label>
                <input
                  type="number"
                  value={settings.security.lockoutDuration}
                  onChange={(e) => handleSettingChange('security', 'lockoutDuration', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API Rate Limit (per minute)</label>
                <input
                  type="number"
                  value={settings.security.apiRateLimit}
                  onChange={(e) => handleSettingChange('security', 'apiRateLimit', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">IP Whitelist (comma-separated)</label>
                <textarea
                  value={settings.security.ipWhitelist}
                  onChange={(e) => handleSettingChange('security', 'ipWhitelist', e.target.value)}
                  placeholder="192.168.1.1, 10.0.0.1"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-4">
              {[
                { key: 'requireSpecialChars', label: 'Require Special Characters', desc: 'Passwords must contain special characters' },
                { key: 'requireNumbers', label: 'Require Numbers', desc: 'Passwords must contain numbers' },
                { key: 'requireUppercase', label: 'Require Uppercase', desc: 'Passwords must contain uppercase letters' },
                { key: 'twoFactorAuth', label: 'Two-Factor Authentication', desc: 'Enable 2FA for enhanced security' }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{setting.label}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{setting.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security[setting.key as keyof typeof settings.security] as boolean}
                      onChange={(e) => handleSettingChange('security', setting.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeSection === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <span className="text-2xl mr-2">🔔</span>
              Notification Settings
            </h2>

            <div className="space-y-4">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Send notifications via email' },
                { key: 'tradeAlerts', label: 'Trade Alerts', desc: 'Notify about trade executions and updates' },
                { key: 'systemAlerts', label: 'System Alerts', desc: 'Important system notifications' },
                { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Promotional and marketing content' },
                { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Automated weekly performance reports' },
                { key: 'maintenanceNotices', label: 'Maintenance Notices', desc: 'System maintenance notifications' }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{setting.label}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{setting.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications[setting.key as keyof typeof settings.notifications] as boolean}
                      onChange={(e) => handleSettingChange('notifications', setting.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trading Settings */}
        {activeSection === 'trading' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <span className="text-2xl mr-2">📈</span>
              Trading Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Leverage</label>
                <input
                  type="number"
                  value={settings.trading.defaultLeverage}
                  onChange={(e) => handleSettingChange('trading', 'defaultLeverage', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Leverage</label>
                <input
                  type="number"
                  value={settings.trading.maxLeverage}
                  onChange={(e) => handleSettingChange('trading', 'maxLeverage', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min Trade Size</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.trading.minTradeSize}
                  onChange={(e) => handleSettingChange('trading', 'minTradeSize', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Trade Size</label>
                <input
                  type="number"
                  value={settings.trading.maxTradeSize}
                  onChange={(e) => handleSettingChange('trading', 'maxTradeSize', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Allowed Trading Symbols</label>
                <textarea
                  value={settings.trading.allowedSymbols}
                  onChange={(e) => handleSettingChange('trading', 'allowedSymbols', e.target.value)}
                  placeholder="EUR/USD,GBP/USD,USD/JPY"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trading Hours</label>
                <select
                  value={settings.trading.tradingHours}
                  onChange={(e) => handleSettingChange('trading', 'tradingHours', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="24/7">24/7</option>
                  <option value="market-hours">Market Hours Only</option>
                  <option value="custom">Custom Hours</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Weekend Trading</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Allow trading during weekends</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.trading.weekendTrading}
                  onChange={(e) => handleSettingChange('trading', 'weekendTrading', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={handleSaveSettings}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl shadow-lg font-semibold transition-all duration-200 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Save Changes</span>
          </button>
        </div>
      )}
    </div>
  );
}
