import { EmptyState, Link, Text } from '@hubspot/ui-extensions';
import {
  hubspot,
  ExtensionPointApiActions,
  SettingsContext,
} from '@hubspot/ui-extensions';

interface SettingsExtensionProps {
  context: SettingsContext;
  actions: ExtensionPointApiActions<'settings'>;
}

hubspot.extend<'settings'>(({ context, actions }: SettingsExtensionProps) => (
  <SettingsPage context={context} actions={actions} />
));

const SettingsPage = ({ context }: SettingsExtensionProps) => {
  console.log({ context });

  const docsLink =
    'https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensibility/create-a-settings-component';

  return (
    <EmptyState
      title="OnboardV1 settings"
      layout="horizontal"
      imageName="building"
    >
      <Text>
        Configure the onboarding flow that runs when a new deal is created. See
        the <Link href={docsLink}>app settings docs</Link> for guidance on what
        you can put here.
      </Text>
    </EmptyState>
  );
};
