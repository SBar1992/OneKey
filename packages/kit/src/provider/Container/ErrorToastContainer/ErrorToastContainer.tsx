import { useEffect } from 'react';

import { useIntl } from 'react-intl';

import type { IButtonProps } from '@onekeyhq/components';
import { Toast, useClipboard } from '@onekeyhq/components';
import type { IAppEventBusPayload } from '@onekeyhq/shared/src/eventBus/appEventBus';
import {
  EAppEventBusNames,
  appEventBus,
} from '@onekeyhq/shared/src/eventBus/appEventBus';
import { ETranslations } from '@onekeyhq/shared/src/locale';
import { isRequestIdMessage } from '@onekeyhq/shared/src/request/utils';

export function ErrorToastContainer() {
  const intl = useIntl();
  const { copyText } = useClipboard();
  useEffect(() => {
    const fn = (p: IAppEventBusPayload[EAppEventBusNames.ShowToast]) => {
      const message = p.message;
      let actionsProps: IButtonProps | undefined;
      if (isRequestIdMessage(message)) {
        actionsProps = {
          children: intl.formatMessage({ id: ETranslations.global_copy }),
          my: '$2',
          size: 'small',
          onPress: () => {
            if (message) {
              copyText(message);
            }
          },
        };
      }
      Toast[p.method]({
        ...p,
        actionsProps,
      });
    };
    appEventBus.on(EAppEventBusNames.ShowToast, fn);
    return () => {
      appEventBus.off(EAppEventBusNames.ShowToast, fn);
    };
  }, [copyText, intl]);

  return null;
}
