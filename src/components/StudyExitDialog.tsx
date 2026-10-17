import { useEffect, useRef } from 'react';
import appStyles from '../App.module.css';
import styles from './StudyExitDialog.module.css';

type Props = {
  onContinue: () => void;
  onExit: () => void;
};

export function StudyExitDialog({ onContinue, onExit }: Props) {
  const dialogRef = useRef<HTMLElement>(null);
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    continueButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onContinue();
        return;
      }
      if (event.key !== 'Tab') return;

      const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>(
        'button:not(:disabled)',
      );
      if (!buttons?.length) return;

      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onContinue]);

  return (
    <div className={styles.backdrop}>
      <section
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-dialog-title"
        aria-describedby="exit-dialog-description"
      >
        <p className="eyebrow">STUDY IN PROGRESS</p>
        <h2 id="exit-dialog-title">학습을 잠시 멈출까요?</h2>
        <p id="exit-dialog-description">
          지금까지의 진행은 저장돼요.
          <br />
          다시 공부를 시작하면 현재 단어부터 이어서 볼 수 있어요.
        </p>
        <div className={styles.actions}>
          <button
            ref={continueButtonRef}
            className={appStyles.secondary}
            type="button"
            onClick={onContinue}
          >
            계속 공부하기
          </button>
          <button
            className={`${appStyles.primary} button-primary`}
            type="button"
            onClick={onExit}
          >
            나가기
          </button>
        </div>
      </section>
    </div>
  );
}
