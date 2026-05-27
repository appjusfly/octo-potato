import { useState } from "react";
import {
  hubspot,
  logger,
  Flex,
  Heading,
  Text,
  Input,
  Toggle,
  Button,
} from "@hubspot/ui-extensions";

hubspot.extend<"settings">(() => <SettingsPage />);

const SettingsPage = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [flowEnabled, setFlowEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    logger.debug("settings saved", { webhookUrl, flowEnabled });
    setSaved(true);
  };

  return (
    <Flex direction="column" gap="medium">
      <Heading>OnboardV1 Settings</Heading>
      <Text>
        Configure how OnboardV1 handles new deal events. Enter your backend
        webhook URL to receive notifications, and enable or disable the
        onboarding flow below.
      </Text>
      <Input
        label="Webhook URL"
        name="webhookUrl"
        value={webhookUrl}
        placeholder="https://your-backend.com/webhook"
        onChange={(val) => {
          setWebhookUrl(val);
          setSaved(false);
        }}
      />
      <Toggle
        label="Enable onboarding flow"
        name="flowEnabled"
        checked={flowEnabled}
        onChange={(val) => {
          setFlowEnabled(val);
          setSaved(false);
        }}
      />
      <Button onClick={handleSave} variant="primary">
        {saved ? "Saved" : "Save Settings"}
      </Button>
    </Flex>
  );
};
