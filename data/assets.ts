/**
 * Named handles for the photos in /public/Assets (the files keep their original hashed names).
 * Use these constants instead of raw paths so swapping a photo is a one-line change.
 */
const A = (f: string) => `/Assets/${f}.jpg`;

export const assets = {
  // Children & therapy
  therapistBlocks: A("bf35932af58f28bf0da1"), // therapist + toddler building blocks
  toddlersPainting: A("064f26fb01c4310e995a"), // little ones painting
  kidsPlayroom: A("c0862527732df8746057"), // toddlers on colourful play mats
  kidsTableGame: A("e77c639a71151de5bf92"), // children playing a table game
  kidsClassroom: A("ac99d181118a1dff0c27"), // smiling children at a learning table
  therapistsWithChild: A("e8ea66770c6804bf849f"), // two therapists working with a child

  // Families
  familyGroup: A("2583ed30ae4fab29bc09"), // parents & children hugging
  familyOutdoor: A("ea6e5812047703bb9c6b"), // mother with children at sunset

  // Team & front desk
  teamMeeting: A("f899ea1dac18ffb26c50"), // multidisciplinary team meeting
  caseConference: A("658e2b0a40814b6774c5"), // staff planning around a table
  consultation: A("e9efa06c1eeea76c2f50"), // one-to-one parent consultation
  reception: A("721ced3985abd6d9b173"), // reception desk
  frontDesk: A("9e0c64281cdc7d4dc0ea"), // front-desk staff with headset

  // Centre & rooms
  classroomGreen: A("04d520ba69b12e70bac7"), // bright classroom with plants
  classroomBlue: A("c49c872ccb93cd53cbf8"), // ocean-themed classroom
  sensoryRoom: A("dd75cb8c0954622bdbe7"), // dark-blue sensory room
  therapyRoom: A("fba29b8bff0b62517be9"), // green therapy room
  playground: A("b04b26d48a330e16ae44"), // outdoor playground
  building: A("3364b2d0529b51e0917d"), // building exterior
};
