import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { TextField, Button, Box, Typography, Grid, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useUI } from '../context/UIContext';
import useNotifications from '../hooks/useNotifications/useNotifications';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'ALL', name: 'Albanian Lek' },
  { code: 'BGN', name: 'Bulgarian Lev' },
  { code: 'HRK', name: 'Croatian Kuna' },
  { code: 'CZK', name: 'Czech Koruna' },
  { code: 'DKK', name: 'Danish Krone' },
  { code: 'HUF', name: 'Hungarian Forint' },
  { code: 'PLN', name: 'Polish Zloty' },
  { code: 'RON', name: 'Romanian Leu' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'RUB', name: 'Russian Ruble' },
  { code: 'THB', name: 'Thai Baht' },
];

const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {subtitle}
      </Typography>
    )}
  </Box>
);

const Section = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      p: 3,
      backgroundColor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      mb: 3,
    }}
  >
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: 2,
      }}
    >
      {children}
    </Box>
  </Box>
);

export default function Settings() {
  const { setPageTitle } = useUI();
  const { show: showNotification } = useNotifications();

  const [store, setStore] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [businessHours, setBusinessHours] = useState('');
  const [currency, setCurrency] = useState<string[]>(['USD']);
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [notificationsEmail, setNotificationsEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    setPageTitle('Settings');
    const s = localStorage.getItem('store');
    if (s) {
      const parsed = JSON.parse(s);
      setStore(parsed);
      setName(parsed.name || '');
      setPhone(parsed.phone || '');
      setEmail(parsed.email || '');
      setAddress(parsed.address || '');
      setDescription(parsed.description || '');
      setBusinessHours(parsed.business_hours || '');
      setCurrency(Array.isArray(parsed.currency) ? parsed.currency : [parsed.currency || 'USD']);
      setWebsite(parsed.website || '');
      setInstagram(parsed.instagram || '');
      setFacebook(parsed.facebook || '');
      setTimezone(parsed.timezone || 'UTC');
      setNotificationsEmail(parsed.notifications_email || '');
      setLogoUrl(parsed.logo_url || '');
    }
  }, []);

  const save = async () => {
    try {
      const response = await api.put('/tenant.php', {
        name,
        phone,
        email,
        address,
        description,
        business_hours: businessHours,
        currency,
        website,
        instagram,
        facebook,
        timezone,
        notifications_email: notificationsEmail,
        logo_url: logoUrl
      });
      
      if (response.data?.success) {
        showNotification('Settings saved successfully!', { severity: 'success', autoHideDuration: 3000 });
        // Update localStorage
        const updated = { ...store, name, phone, email, address, description, business_hours: businessHours, currency, website, instagram, facebook, timezone, notifications_email: notificationsEmail, logo_url: logoUrl };
        localStorage.setItem('store', JSON.stringify(updated));
      } else {
        showNotification('Failed to save settings: ' + (response.data?.error || 'Unknown error'), { severity: 'error', autoHideDuration: 3000 });
      }
    } catch (error: any) {
      showNotification('Failed to save settings: ' + (error?.response?.data?.error || error.message), { severity: 'error', autoHideDuration: 3000 });
      console.error(error);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
        Store Settings
      </Typography>

      {/* Section 1: Basic Store Information */}
      <Section>
        <Box sx={{ gridColumn: '1 / -1' }}>
          <SectionTitle
            title="📋 Basic Store Information"
            subtitle="Core details about your store"
          />
        </Box>
        <TextField
          label="Store Name"
          value={name}
          onChange={e => setName(e.target.value)}
          fullWidth
          variant="outlined"
        />
        <TextField
          label="Store Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          fullWidth
          variant="outlined"
        />
        <Box sx={{ gridColumn: '1 / -1' }}>
          <TextField
            label="Store Description/Bio"
            value={description}
            onChange={e => setDescription(e.target.value)}
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            placeholder="A short description of your store..."
          />
        </Box>
      </Section>

      {/* Section 2: Contact Information */}
      <Section>
        <Box sx={{ gridColumn: '1 / -1' }}>
          <SectionTitle
            title="📞 Contact Information"
            subtitle="How customers can reach you"
          />
        </Box>
        <TextField
          label="Phone (WhatsApp)"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          fullWidth
          variant="outlined"
        />
        <TextField
          label="Address"
          value={address}
          onChange={e => setAddress(e.target.value)}
          fullWidth
          variant="outlined"
        />
      </Section>

      {/* Section 3: Business Information */}
      <Section>
        <Box sx={{ gridColumn: '1 / -1' }}>
          <SectionTitle
            title="🕐 Business Information"
            subtitle="Operating hours and currency settings"
          />
        </Box>
        <TextField
          label="Business Hours"
          value={businessHours}
          onChange={e => setBusinessHours(e.target.value)}
          fullWidth
          variant="outlined"
          placeholder="e.g., 10:00 - 22:00"
        />
        <FormControl fullWidth variant="outlined">
          <InputLabel>Currencies</InputLabel>
          <Select
            multiple
            label="Currencies"
            value={currency}
            onChange={e => setCurrency(typeof e.target.value === 'string' ? [e.target.value] : e.target.value)}
          >
            {CURRENCIES.map(curr => (
              <MenuItem key={curr.code} value={curr.code}>
                {curr.code} - {curr.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Timezone"
          value={timezone}
          onChange={e => setTimezone(e.target.value)}
          fullWidth
          variant="outlined"
          placeholder="e.g., UTC, America/New_York"
        />
      </Section>

      {/* Section 4: Online Presence */}
      <Section>
        <Box sx={{ gridColumn: '1 / -1' }}>
          <SectionTitle
            title="🌐 Online Presence"
            subtitle="Website and branding"
          />
        </Box>
        <TextField
          label="Website"
          value={website}
          onChange={e => setWebsite(e.target.value)}
          fullWidth
          variant="outlined"
          placeholder="https://example.com"
        />
        <TextField
          label="Logo URL"
          value={logoUrl}
          onChange={e => setLogoUrl(e.target.value)}
          fullWidth
          variant="outlined"
          placeholder="https://example.com/logo.png"
        />
      </Section>

      {/* Section 5: Social Media */}
      <Section>
        <Box sx={{ gridColumn: '1 / -1' }}>
          <SectionTitle
            title="📱 Social Media"
            subtitle="Connect with your customers on social platforms"
          />
        </Box>
        <TextField
          label="Instagram Profile"
          value={instagram}
          onChange={e => setInstagram(e.target.value)}
          fullWidth
          variant="outlined"
          placeholder="@yourprofile or full URL"
        />
        <TextField
          label="Facebook Page"
          value={facebook}
          onChange={e => setFacebook(e.target.value)}
          fullWidth
          variant="outlined"
          placeholder="Full Facebook URL"
        />
      </Section>

      {/* Section 6: Notifications */}
      <Section>
        <Box sx={{ gridColumn: '1 / -1' }}>
          <SectionTitle
            title="🔔 Notifications"
            subtitle="Where to receive order alerts"
          />
        </Box>
        <Box sx={{ gridColumn: '1 / -1' }}>
          <TextField
            label="Order Notifications Email"
            type="email"
            value={notificationsEmail}
            onChange={e => setNotificationsEmail(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="Where to receive new orders"
          />
        </Box>
      </Section>

      {/* Save Button */}
      <Box sx={{ pt: 2 }}>
        <Button
          onClick={save}
          variant="contained"
          size="large"
          sx={{
            px: 4,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
          }}
        >
          💾 Save Settings
        </Button>
      </Box>
    </Box>
  );
}
