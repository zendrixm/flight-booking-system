import { useState } from 'react';

import { PageContainer } from '@/components/layout';
import { useAsyncData, useDocumentTitle } from '@/hooks';
import { listOpenRoles } from '@/services/companyService';

import { AboutHero } from '../components/AboutHero';
import { AboutSection } from '../components/AboutSection';
import { CompanyStats } from '../components/CompanyStats';
import { CareersDialog } from '../components/dialogs/CareersDialog';
import { PartnerDialog } from '../components/dialogs/PartnerDialog';
import { PressKitDialog } from '../components/dialogs/PressKitDialog';
import { OfficeList } from '../components/OfficeList';
import { PromiseCards } from '../components/PromiseCards';
import { StoryTimeline } from '../components/StoryTimeline';
import { WorkWithUs, type AboutDialog } from '../components/WorkWithUs';

export function AboutPage() {
  useDocumentTitle('About Vela');
  const roles = useAsyncData('open-roles', listOpenRoles);
  const [openDialog, setOpenDialog] = useState<AboutDialog | null>(null);
  const closeDialog = () => setOpenDialog(null);

  return (
    <main>
      <AboutHero onSeeOpenRoles={() => setOpenDialog('careers')} />
      <PageContainer layout="stack">
        <CompanyStats />
        <AboutSection id="promises" title="What we promise">
          <PromiseCards />
        </AboutSection>
        <StoryTimeline />
        <AboutSection id="offices" title="Where we work">
          <OfficeList />
        </AboutSection>
        <AboutSection id="work-with-us" title="Work with us">
          <WorkWithUs openRoleCount={roles.data?.length} onOpen={setOpenDialog} />
        </AboutSection>
      </PageContainer>

      {openDialog === 'careers' && <CareersDialog roles={roles.data} onClose={closeDialog} />}
      {openDialog === 'partner' && <PartnerDialog onClose={closeDialog} />}
      {openDialog === 'press' && <PressKitDialog onClose={closeDialog} />}
    </main>
  );
}
