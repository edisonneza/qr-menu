import { useColorScheme } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectProps } from '@mui/material/Select';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import ReactCountryFlag from "react-country-flag";

export default function LanguageSelect(props: SelectProps) {
  const { i18n } = useTranslation();

  const languages = [
    { code: "en", label: "En", flag: "GB" },
    { code: "al", label: "Al", flag: "AL" },
  ];

  const currentLang =
    languages.find((l) => l.code === i18n.language)?.code || "en";

  return (
    <Select
      sx={{ maxWidth: 70 }}
      IconComponent={() => null}
      value={currentLang}
      onChange={(e: any) => i18n.changeLanguage(e.target.value)}
      renderValue={(value) => {
        const lang = languages.find((l) => l.code === value);
        return (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ReactCountryFlag
              countryCode={lang!.flag}
              svg
              style={{ marginRight: 8, fontSize: "1.3em" }}
            />
            {lang!.label}
          </Box>
        );
      }}
      {...props}
    >
      {languages.map((lang) => (
        <MenuItem key={lang.code} value={lang.code}>
          <ReactCountryFlag
            countryCode={lang.flag}
            svg
            style={{ marginRight: 8, fontSize: "1.3em" }}
          />
          {lang.label}
        </MenuItem>
      ))}
    </Select>
  );
}
