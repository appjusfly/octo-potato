import { Text } from '@hubspot/ui-extensions';
import { PageBreadcrumbs, PageTitle } from '@hubspot/ui-extensions/pages';

export const HomePage = () => {
  return (
    <>
      <PageBreadcrumbs>
        <PageBreadcrumbs.Current>Home</PageBreadcrumbs.Current>
      </PageBreadcrumbs>
      <PageTitle>OnboardV1</PageTitle>

      <Text>
        Welcome to OnboardV1. This app listens for new deals in HubSpot and
        kicks off your onboarding flow.
      </Text>
    </>
  );
};
