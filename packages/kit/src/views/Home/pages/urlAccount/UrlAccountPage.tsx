import { useCallback, useEffect, useState } from 'react';

import { cloneDeep } from 'lodash';
import { useIntl } from 'react-intl';

import {
  Button,
  NavBackButton,
  Page,
  SizableText,
  Spinner,
  Stack,
  Toast,
} from '@onekeyhq/components';
import backgroundApiProxy from '@onekeyhq/kit/src/background/instance/backgroundApiProxy';
import { AccountSelectorProviderMirror } from '@onekeyhq/kit/src/components/AccountSelector';
import useAppNavigation from '@onekeyhq/kit/src/hooks/useAppNavigation';
import { useAppRoute } from '@onekeyhq/kit/src/hooks/useAppRoute';
import { useAccountSelectorActions } from '@onekeyhq/kit/src/states/jotai/contexts/accountSelector';
import { WALLET_TYPE_WATCHING } from '@onekeyhq/shared/src/consts/dbConsts';
import { ETranslations } from '@onekeyhq/shared/src/locale';
import platformEnv from '@onekeyhq/shared/src/platformEnv';
import timerUtils from '@onekeyhq/shared/src/utils/timerUtils';
import type { IServerNetwork } from '@onekeyhq/shared/types';
import { EAccountSelectorSceneName } from '@onekeyhq/shared/types';
import { EUniversalSearchType } from '@onekeyhq/shared/types/search';

import { HomePageView } from '../HomePageView';

import { UrlAccountAutoReplaceHistory } from './UrlAccountAutoReplaceHistory';
import { getPrevUrlAccount, urlAccountNavigation } from './urlAccountUtils';

const sceneName = EAccountSelectorSceneName.homeUrlAccount;

function UrlAccountPage() {
  return (
    <>
      <HomePageView key={sceneName} sceneName={sceneName} />
      <UrlAccountAutoReplaceHistory num={0} />
    </>
  );
}

function UrlAccountAutoCreate({ redirectMode }: { redirectMode?: boolean }) {
  const intl = useIntl();
  const route = useAppRoute();
  const navigation = useAppNavigation();
  const routeParams = route.params as
    | { address: string; networkId?: string }
    | undefined;
  const actions = useAccountSelectorActions();
  const [urlAccountStatus, setUrlAccountStatus] = useState<
    'ok' | 'invalid' | undefined
  >();

  useEffect(() => {
    if (
      !platformEnv.isDev &&
      platformEnv.isDesktop &&
      route.path === '/index.html' // production Desktop use `file:///index.html` not `file:///` as init route
    ) {
      const newRouteParams = cloneDeep(routeParams);
      // 'file:///?networkId=index.html'
      if (newRouteParams && newRouteParams?.networkId === 'index.html') {
        delete newRouteParams.networkId;
      }
      urlAccountNavigation.replaceHomePage(navigation, newRouteParams);
      return;
    }

    setTimeout(async () => {
      let networkId = routeParams?.networkId;
      let networkCode = routeParams?.networkId;
      let routeAddress = routeParams?.address;

      const fixNetworkParams = (network: IServerNetwork | undefined) => {
        if (network) {
          networkId = network.id;
          networkCode = network.code;
        }
      };

      // eslint-disable-next-line spellcheck/spell-checker
      // not full url like: /0x63ac73816EeB38514DaE6c46008baf55f1c59C9e
      if (!routeAddress && networkId) {
        routeAddress = networkId;
        networkId = undefined;
        networkCode = undefined;
        const result =
          await backgroundApiProxy.serviceUniversalSearch.universalSearch({
            input: routeAddress,
            searchTypes: [EUniversalSearchType.Address],
          });
        const firstAddressItemPayload =
          result?.[EUniversalSearchType.Address]?.items?.[0]?.payload;
        if (firstAddressItemPayload) {
          const { network } = firstAddressItemPayload;
          fixNetworkParams(network);
        }
      }

      let hasError = false;
      // routeParams?.networkId may be networkCode
      let network = await backgroundApiProxy.serviceNetwork.getNetworkSafe({
        code: networkCode,
      });
      if (network) {
        fixNetworkParams(network);
      } else {
        network = await backgroundApiProxy.serviceNetwork.getNetworkSafe({
          networkId,
        });
        if (network) {
          fixNetworkParams(network);
        }
      }
      if (!networkId || !routeAddress) {
        hasError = true;
      }
      const prevAccount = getPrevUrlAccount();

      if (
        networkId &&
        routeAddress &&
        (routeAddress?.toLowerCase() !== prevAccount?.address?.toLowerCase() ||
          networkId !== prevAccount?.networkId)
      ) {
        try {
          const r = await backgroundApiProxy.serviceAccount.addWatchingAccount({
            input: routeAddress,
            networkId,
            deriveType: undefined,
            isUrlAccount: true,
          });

          void actions.current.updateSelectedAccountForSingletonAccount({
            num: 0,
            networkId,
            walletId: WALLET_TYPE_WATCHING,
            othersWalletAccountId: r.accounts[0].id,
          });
        } catch (error) {
          console.error('UrlAccountAutoCreate error: ', error);
          Toast.error({
            title: `Unsupported address or network: ${routeAddress}`,
          });
          hasError = true;
        }
      }

      if (hasError) {
        setUrlAccountStatus('invalid');
      } else {
        setUrlAccountStatus('ok');
        if (redirectMode) {
          // replace Landing to Home first to make sure history back & forward works
          urlAccountNavigation.replaceHomePage(navigation);
          if (routeAddress) {
            await timerUtils.wait(1);
            urlAccountNavigation.pushUrlAccountPage(navigation, {
              address: routeAddress,
              networkId: networkCode,
            });
          }
        }
      }
    }, 0);
  }, [
    actions,
    navigation,
    redirectMode,
    route.params,
    route.path,
    routeParams,
    routeParams?.address,
    routeParams?.networkId,
  ]);

  const backToHomePage = useCallback(() => {
    urlAccountNavigation.replaceHomePage(navigation);
  }, [navigation]);

  const renderHeaderLeft = useCallback(
    () => <NavBackButton onPress={backToHomePage} />,
    [backToHomePage],
  );

  if (urlAccountStatus === 'invalid') {
    return (
      <Page>
        <Page.Header headerLeft={renderHeaderLeft} />
        <Stack flex={1} ai="center" jc="center">
          <SizableText size="$headingXl">
            {intl.formatMessage({ id: ETranslations.global_404_message })}
          </SizableText>
          {process.env.NODE_ENV !== 'production' ? (
            <SizableText my="$6">{JSON.stringify(routeParams)}</SizableText>
          ) : null}
        </Stack>
      </Page>
    );
  }

  // render directly if not redirectMode
  if (urlAccountStatus === 'ok' && !redirectMode) {
    return <UrlAccountPage />;
  }

  return (
    <Stack flex={1} alignContent="center" justifyContent="center">
      <Spinner size="small" />
    </Stack>
  );
}

export function UrlAccountPageContainer() {
  return (
    <AccountSelectorProviderMirror
      config={{
        sceneName,
        sceneUrl: '',
      }}
      enabledNum={[0]}
    >
      <UrlAccountAutoCreate />
    </AccountSelectorProviderMirror>
  );
}

export function UrlAccountLanding() {
  return (
    <AccountSelectorProviderMirror
      config={{
        sceneName,
        sceneUrl: '',
      }}
      enabledNum={[0]}
    >
      <UrlAccountAutoCreate redirectMode />
    </AccountSelectorProviderMirror>
  );
}
