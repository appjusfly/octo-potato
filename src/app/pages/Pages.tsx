import { ExtensionPointApiActions, PagesContext } from '@hubspot/ui-extensions';
import { hubspot } from '@hubspot/ui-extensions';
import {
  createPageRouter,
  PageHeader,
  PageRoutes,
  PageRoutesLayoutProps,
} from '@hubspot/ui-extensions/pages';
import { HomePage } from './HomePage.tsx';

interface PagesExtensionProps {
  context: PagesContext;
  actions: ExtensionPointApiActions<'pages'>;
}

const PageLayout = ({ children }: PageRoutesLayoutProps) => {
  return (
    <>
      <PageHeader>
        <PageHeader.PrimaryAction>
          <PageHeader.Link href="https://developers.hubspot.com/docs/apps/developer-platform/add-features/ui-extensions/extension-points/app-pages/overview">
            Platform Docs
          </PageHeader.Link>
        </PageHeader.PrimaryAction>
      </PageHeader>
      {children}
    </>
  );
};

const PageRouter = createPageRouter(
  <PageRoutes layoutComponent={PageLayout}>
    <PageRoutes.IndexRoute component={HomePage} />
  </PageRoutes>,
);

const PagesExtension = ({ context, actions }: PagesExtensionProps) => {
  console.log({ context, actions });
  return <PageRouter />;
};

hubspot.extend<'pages'>(({ context, actions }: PagesExtensionProps) => (
  <PagesExtension context={context} actions={actions} />
));
