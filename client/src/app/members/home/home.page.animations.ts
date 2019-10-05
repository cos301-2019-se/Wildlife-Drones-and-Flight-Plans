import { trigger, style, animate, transition, group } from '@angular/animations';

export const animations = [
  trigger('button-animation', [
    transition(':enter', [
      style({
        opacity: 0,
        transform: 'scale(0.5)',
      }),
      group([
        animate('200ms ease-out', style({
          opacity: 1,
          transform: 'scale(1)',
        }))
      ]),
    ]),
    transition(':leave', [
      group([
        animate('200ms ease-out', style({
          opacity: 0,
          transform: 'scale(0.5)',
        })),
      ]),
    ]),
  ]),

  trigger('add-button-animation', [
    transition(':enter', [
      style({
        opacity: 0,
        transform: 'scale(0.5) translate(-50%, -75%)',
      }),
      group([
        animate('200ms ease-out', style({
          opacity: 1,
          transform: 'scale(1) translate(-50%, -75%)',
        }))
      ]),
    ]),
    transition(':leave', [
      group([
        animate('200ms ease-out', style({
          opacity: 0,
          transform: 'scale(0.5) translate(-50%, -75%)',
        })),
      ]),
    ]),
  ]),

  trigger('place-marker-animation', [
    transition(':enter', [
      style({
        opacity: 0,
        transform: 'translateY(-140px)',
      }),
      group([
        animate('300ms ease-in', style({
          opacity: 1,
          transform: 'translateY(0)',
        })),
      ]),
    ]),
    transition(':leave', [
      group([
        animate('300ms ease-in', style({
          opacity: 0,
          transform: 'scale(0)',
        })),
      ]),
    ]),
  ]),

  trigger('tooltip-animation', [
    transition(':enter', [
      style({
        opacity: 0,
        transform: 'translate(-50%, -50px)',
      }),
      group([
        animate('600ms ease-in', style({
          opacity: 1,
          transform: 'translate(-50%, 0)',
        })),
      ])
    ]),
    transition(':leave', [
      group([
        animate('600ms ease-out', style({
          opacity: 0,
          transform: 'translate(-50%, -50px)',
        })),
      ])
    ]),
  ]),

  trigger('form-animation', [
    transition(':enter', [
      style({
        opacity: 0,
        transform: 'translateX(-50%) scale(0.9) perspective(600px) rotateX(20deg)',
      }),
      group([
        animate('300ms ease-in', style({
          opacity: 1,
          transform: 'translateX(-50%) scale(1) perspective(600px) rotateX(0)',
        })),
      ])
    ]),
    transition(':leave', [
      group([
        animate('300ms ease-out', style({
          opacity: 0,
          transform: 'translateX(-50%) scale(0.9) perspective(600px) rotateX(20deg)',
        })),
      ])
    ]),
  ])
];
