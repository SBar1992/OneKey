import type { ComponentProps } from 'react';
import { useCallback } from 'react';

import { useIntl } from 'react-intl';

import { Dialog, useClipboard } from '@onekeyhq/components';
import { ECoreApiExportedSecretKeyType } from '@onekeyhq/core/src/types';
import backgroundApiProxy from '@onekeyhq/kit/src/background/instance/backgroundApiProxy';
import { useReviewControl } from '@onekeyhq/kit/src/components/ReviewControl';
import useAppNavigation from '@onekeyhq/kit/src/hooks/useAppNavigation';
import { usePromiseResult } from '@onekeyhq/kit/src/hooks/usePromiseResult';
import { useActiveAccount } from '@onekeyhq/kit/src/states/jotai/contexts/accountSelector';
import { openUrl } from '@onekeyhq/kit/src/utils/openUrl';
import { useSupportNetworkId } from '@onekeyhq/kit/src/views/FiatCrypto/hooks';
import { useDevSettingsPersistAtom } from '@onekeyhq/kit-bg/src/states/jotai/atoms';
import { ETranslations } from '@onekeyhq/shared/src/locale';
import {
  EModalFiatCryptoRoutes,
  EModalRoutes,
} from '@onekeyhq/shared/src/routes';
import { buildExplorerAddressUrl } from '@onekeyhq/shared/src/utils/uriUtils';

import { RawActions } from './RawActions';

export function WalletActionMore() {
  const [devSettings] = useDevSettingsPersistAtom();
  const {
    activeAccount: { account, network, wallet },
  } = useActiveAccount({ num: 0 });
  const intl = useIntl();
  const { copyText } = useClipboard();
  const navigation = useAppNavigation();
  const { result: isSupported } = useSupportNetworkId(
    network?.id ?? '',
    'sell',
  );
  const sellCrypto = useCallback(() => {
    navigation.pushModal(EModalRoutes.FiatCryptoModal, {
      screen: EModalFiatCryptoRoutes.SellModal,
      params: { networkId: network?.id ?? '', accountId: account?.id ?? '' },
    });
  }, [navigation, network, account]);
  const show = useReviewControl();

  const vaultSettings = usePromiseResult(async () => {
    const settings = await backgroundApiProxy.serviceNetwork.getVaultSettings({
      networkId: network?.id ?? '',
    });
    return settings;
  }, [network?.id]).result;

  const sections: ComponentProps<typeof RawActions.More>['sections'] = [
    {
      items: [
        {
          label: intl.formatMessage({ id: ETranslations.global_copy_address }),
          icon: 'Copy1Outline',
          onPress: () => copyText(account?.address || ''),
        },
      ],
    },
  ];

  if (!vaultSettings?.hideBlockExplorer) {
    sections.unshift({
      items: [
        {
          label: intl.formatMessage({
            id: ETranslations.global_view_in_blockchain_explorer,
          }),
          icon: 'GlobusOutline',
          onPress: () =>
            openUrl(
              buildExplorerAddressUrl({
                network,
                address: account?.address,
              }),
            ),
        },
      ],
    });
  }

  if (show) {
    sections.unshift({
      items: [
        {
          label: intl.formatMessage({ id: ETranslations.global_sell }),
          icon: 'MinusLargeOutline',
          disabled: !isSupported,
          onPress: sellCrypto,
        },
      ],
    });
  }

  if (devSettings?.settings?.showDevExportPrivateKey) {
    const exportAccountCredentialKey = async ({
      keyType,
    }: {
      keyType: ECoreApiExportedSecretKeyType;
    }) => {
      console.log('ExportSecretKeys >>>> ', keyType);
      let r: string | undefined = '';
      if (
        keyType === ECoreApiExportedSecretKeyType.xpub ||
        keyType === ECoreApiExportedSecretKeyType.publicKey
      ) {
        r = await backgroundApiProxy.serviceAccount.exportAccountPublicKey({
          accountId: account?.id || '',
          networkId: network?.id || '',
          keyType,
        });
      } else {
        r = await backgroundApiProxy.serviceAccount.exportAccountSecretKey({
          accountId: account?.id || '',
          networkId: network?.id || '',
          keyType,
        });
      }
      console.log('ExportSecretKeys >>>> ', r);
      console.log(
        'ExportSecretKeys >>>> ',
        wallet?.type,
        keyType,
        account?.address,
      );
      Dialog.show({
        title: 'Key',
        description: r,
        onConfirmText: 'Copy',
        onConfirm() {
          copyText(r || '');
        },
      });
    };
    sections.unshift({
      items: [
        {
          label: 'Export Public Key',
          icon: 'MinusLargeOutline',
          onPress: () => {
            void exportAccountCredentialKey({
              keyType: ECoreApiExportedSecretKeyType.publicKey,
            });
          },
        },
        {
          label: 'Export xpub',
          icon: 'MinusLargeOutline',
          onPress: () => {
            void exportAccountCredentialKey({
              keyType: ECoreApiExportedSecretKeyType.xpub,
            });
          },
        },
        {
          label: 'Export Private Key',
          icon: 'MinusLargeOutline',
          onPress: () => {
            void exportAccountCredentialKey({
              keyType: ECoreApiExportedSecretKeyType.privateKey,
            });
          },
        },
        {
          label: 'Export xprvt',
          icon: 'MinusLargeOutline',
          onPress: () => {
            void exportAccountCredentialKey({
              keyType: ECoreApiExportedSecretKeyType.xprvt,
            });
          },
        },
      ],
    });
  }

  return <RawActions.More sections={sections} />;
}
