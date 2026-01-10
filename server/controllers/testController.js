const { response } = require('express');
const { randomFromArray, randomBool, randomDate, randomSerial } = require('../Utils/randomFunctions')
const { model: Repair } = require('../models/Repairs'); // adjust path
const { performenceExpectationOptions, waitingHHTypeRequiredString, michlalNeedOptions, tipulTypeOptions, intendedOptions, hatakTypeOptions, manoiyaOptions, ogdotOptions, waitingHHTypeOptions, hatakStatusOptions } = require('../Utils/options')

// Dummy user to assign as addedBy for seeded documents
const dummyUser = {
    fullName: 'Seed User',
    pid: '0000'
};

const seedRepairs = async (req, res) => {
    let { amount } = req.query;
    amount = Number(amount) || 10;

    const docs = [];
    const usedEngineSerials = new Set();

    try {
        // 1️⃣ get all existing engineSerials from DB
        const existingSerials = await Repair.find({}, { engineSerial: 1, _id: 0 });
        existingSerials.forEach(doc => usedEngineSerials.add(doc.engineSerial));

        // 2️⃣ generate documents
        while (docs.length < amount) {
            const engineSerial = randomSerial();

            // skip if already in DB or in this batch
            if (usedEngineSerials.has(engineSerial)) continue;
            usedEngineSerials.add(engineSerial);

            docs.push({
                manoiya: randomFromArray(manoiyaOptions),
                hatakType: randomFromArray(hatakTypeOptions),
                sendingDivision: randomFromArray(ogdotOptions),
                sendingBrigade: `חטיבה ${Math.floor(Math.random() * 10)}`,
                sendingBattalion: `גדוד ${Math.floor(Math.random() * 100)}`,

                tipulType: randomFromArray(tipulTypeOptions),
                zadik: Math.floor(Math.random() * 10),

                reciveDate: randomDate(),

                engineSerial,
                minseretSerial: randomBool() ? randomSerial('MIN') : undefined,

                hatakStatus: randomFromArray(hatakStatusOptions),
                problem: 'בעיה כללית לבדיקה',

                waitingHHType: randomBool()
                    ? [randomFromArray(waitingHHTypeOptions)]
                    : [],

                detailsHH: randomBool() ? 'פירוט ח"ח לדוגמה' : '',

                michlalNeed: randomFromArray(michlalNeedOptions),

                recivingDivision: randomFromArray(ogdotOptions),
                recivingBrigade: `חטיבה ${Math.floor(Math.random() * 10)}`,
                recivingBattalion: `גדוד ${Math.floor(Math.random() * 100)}`,

                startWorkingDate: randomBool() ? randomDate() : null,

                forManoiya: randomFromArray(manoiyaOptions),
                performenceExpectation: randomFromArray(performenceExpectationOptions),

                detailsOfNonCompliance: randomBool()
                    ? 'אי עמידה בזמנים'
                    : '',

                intended: randomFromArray(intendedOptions),

                // Assign addedBy field for new schema
                addeBy: { ...dummyUser },
            });
        }

        await Repair.insertMany(docs, { ordered: false });
        res.status(200).json({ msg: `✅ Inserted ${docs.length} repair documents` });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};

module.exports = {
    seedRepairs
};
