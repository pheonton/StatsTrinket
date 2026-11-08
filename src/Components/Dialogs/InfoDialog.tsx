import {
  CommanderTax,
  Energy,
  Experience,
  Monarch,
  PartnerTax,
  Poison,
} from '../../Icons/generated';
import { Separator } from '../Misc/Separator';
import { Paragraph } from '../Misc/TextComponents';
import { Dialog } from './Dialog';

export const InfoDialog = ({
  dialogRef,
}: {
  dialogRef: React.MutableRefObject<HTMLDialogElement | null>;
}) => {
  return (
    <Dialog id="info" title="Info" dialogRef={dialogRef}>
      <div className=" text-text-primary">
        <h2 className="text-md underline">Contributors</h2>
        <div className="flex flex-row items-center gap-1 text-sm">
          {/* <Trinket className="size-4" /> */}
          <div className="flex flex-col">
            <div>
              <a
                href="https://github.com/Vikeo"
                target="_blank"
                className="text-text-secondary underline"
              >
                Vikeo
              </a>
              : Creator of the original Life Trinket
            </div>
            <div>
              <a
                href="https://github.com/pheonton"
                target="_blank"
                className="text-text-secondary underline"
              >
                pheonton
              </a>
              : Stats Trinket
            </div>
            <div>
              <a href="#" className="text-text-secondary underline">
                Elin
              </a>
              : Icon design
            </div>
          </div>
        </div>
        <div className="mt-2 text-text-primary">
          Visit the{' '}
          <a
            href="https://github.com/pheonton/StatsTrinket"
            target="_blank"
            className="text-text-secondary underline"
          >
            GitHub
          </a>{' '}
          to contribute or learn more about this web app.
        </div>
        <Separator height="1px" />
      </div>
      <div className="text-text-primary mt-4">
        <div className="text">
          <h2 className="text-xl">📋 Usage Guide</h2>
          <Separator height="1px" />
        </div>
        <div className="text-text-primary">
          <Paragraph className="mb-4">
            There are some controls that you might not know about, so here's a
            short list of them.
          </Paragraph>
          <h3 className="text-lg font-bold mb-2">Life counter</h3>
          <ul className="list-disc ml-6 mb-4">
            <li>
              <strong>Tap</strong> on a player's + or - button to add or
              subtract <strong>1 life</strong>.
            </li>
            <li>
              <strong>Long press</strong> on a player's + or - button to add or
              subtract <strong>10 life</strong>.
            </li>
          </ul>

          <h3 className="text-lg font-bold mb-2">
            Commander damage and other counters
          </h3>
          <ul className="list-disc ml-6 mb-4">
            <li>
              <strong>Tap</strong> on the counter to add{' '}
              <strong>1 counter</strong>.
            </li>
            <li>
              <strong>Long press</strong> on the counter to subtract{' '}
              <strong>1 counter</strong>.
            </li>
          </ul>

          <h3 className="text-lg font-bold mb-1">Other counter symbols</h3>
          <ul className="list-disc ml-6 mb-4">
            <li className="flex items-center">
              <CommanderTax className="size-6" /> - Commander Tax
            </li>
            <li className="flex items-center">
              <PartnerTax className="size-6" /> - Partner Tax
            </li>
            <li className="flex items-center">
              <Poison className="size-6" /> - Poison
            </li>
            <li className="flex items-center">
              <Energy className="size-6" /> - Energy
            </li>
            <li className="flex items-center">
              <Experience className="size-6" /> - Experience
            </li>
            <li className="flex items-center">
              <Monarch className="size-6" /> - Monarch
            </li>
          </ul>

          <h3 className="text-lg font-bold mb-2">Other functionality</h3>
          <ul className="list-disc ml-6">
            <li>
              <Paragraph className="mb-1">
                When a player is <strong>at or below 0 life</strong>, has taken{' '}
                <strong>21 or more Commander Damage</strong> or has{' '}
                <strong>10 or more poison counters</strong>, a button with a
                skull will appear on that player's card. Tapping it will dim the
                player's card.
              </Paragraph>
            </li>
            <li>
              <Paragraph className="mb-4">
                Swiping <strong>down</strong> on a player's card will show that
                player's settings menu.
              </Paragraph>
            </li>
          </ul>

          <h3 className="text-lg font-bold mb-2">Acknowledgements </h3>
          <Paragraph>
            Stats Trinket is unofficial Fan Content permitted under the{' '}
            <a
              href="https://company.wizards.com/en/legal/fancontentpolicy"
              className="text-text-secondary underline"
              target="_blank"
            >
              Fan Content Policy
            </a>
            . Not approved or endorsed by Wizards. Portions of the material or
            concepts, such as "Commander", used are property of Wizards of the
            Coast. ©Wizards of the Coast LLC.
          </Paragraph>
          <Paragraph className="mt-2">
            Commander card art is fetched on demand from{' '}
            <a
              href="https://scryfall.com"
              className="text-text-secondary underline"
              target="_blank"
            >
              Scryfall
            </a>{' '}
            and never stored. Card images and artwork are © Wizards of the Coast
            and the credited illustrators; the artist is shown in the commander
            picker.
          </Paragraph>
        </div>
      </div>
    </Dialog>
  );
};
