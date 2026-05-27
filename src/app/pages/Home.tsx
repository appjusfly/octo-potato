import { hubspot, logger, Flex, Heading, Text, Divider } from "@hubspot/ui-extensions";
import {
  HeaderActions,
  PrimaryHeaderActionButton,
} from "@hubspot/ui-extensions/pages/home";

hubspot.extend(() => <AppHomePage />);

const AppHomePage = () => {
  return (
    <>
      <HeaderActions>
        <PrimaryHeaderActionButton
          onClick={() => logger.debug("configure settings clicked")}
        >
          Configure Settings
        </PrimaryHeaderActionButton>
      </HeaderActions>

      <Flex direction="column" gap="large">
        <Heading>OnboardV1 Dashboard</Heading>
        <Text>
          OnboardV1 listens for new HubSpot deals and automatically triggers
          your onboarding flow. Use the Settings panel to configure recipients
          and triggers.
        </Text>
        <Divider />
        <Flex direction="row" gap="extra-large">
          <Flex direction="column" gap="small">
            <Heading>Deals Processed</Heading>
            <Text>Connect your backend to display live counts.</Text>
          </Flex>
          <Flex direction="column" gap="small">
            <Heading>Flows Triggered</Heading>
            <Text>Connect your backend to display live counts.</Text>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};
