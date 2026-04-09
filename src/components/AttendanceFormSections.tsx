import { AttendanceFormData } from '../types/attendance-types';

interface AttendanceFormSectionsProps {
  formData: AttendanceFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AttendanceFormSections = ({ formData, onChange }: AttendanceFormSectionsProps) => {
  return (
    <>
      <h2>Section Counts</h2>

      {/* Mission College Main Room */}
      {formData.location === 'mission-college-main' && (
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="farLeft">Far left *</label>
            <input
              type="number"
              id="farLeft"
              name="farLeft"
              value={formData.farLeft}
              onChange={onChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="left">Left *</label>
            <input
              type="number"
              id="left"
              name="left"
              value={formData.left}
              onChange={onChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="middleLeft">Middle left *</label>
            <input
              type="number"
              id="middleLeft"
              name="middleLeft"
              value={formData.middleLeft}
              onChange={onChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="middleRight">Middle right *</label>
            <input
              type="number"
              id="middleRight"
              name="middleRight"
              value={formData.middleRight}
              onChange={onChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="right">Right *</label>
            <input
              type="number"
              id="right"
              name="right"
              value={formData.right}
              onChange={onChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="farRight">Far right *</label>
            <input
              type="number"
              id="farRight"
              name="farRight"
              value={formData.farRight}
              onChange={onChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="back">Back *</label>
            <input
              type="number"
              id="back"
              name="back"
              value={formData.back}
              onChange={onChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="adjustment">Adjustment *</label>
            <input
              type="number"
              id="adjustment"
              name="adjustment"
              value={formData.adjustment}
              onChange={onChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="kids">Kids (Total from all locations) *</label>
            <input
              type="number"
              id="kids"
              name="kids"
              value={formData.kids}
              onChange={onChange}
              min="0"
              required
            />
          </div>
        </div>
      )}

      {/* Mission College Overflow Room */}
      {formData.location === 'mission-college-overflow' && (
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="overflow1">Overflow 1: Gillmor Lecture Hall 103 *</label>
            <input
              type="number"
              id="overflow1"
              name="overflow1"
              value={formData.overflow1}
              onChange={onChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="overflow2">Overflow 2: Gillmor Lecture Hall 107 *</label>
            <input
              type="number"
              id="overflow2"
              name="overflow2"
              value={formData.overflow2}
              onChange={onChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="momsRoom">Mom's Room: Gillmor Classroom 202 *</label>
            <input
              type="number"
              id="momsRoom"
              name="momsRoom"
              value={formData.momsRoom}
              onChange={onChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="familyRoom">Family Room: Gillmor Classroom 219 (Adults only) *</label>
            <input
              type="number"
              id="familyRoom"
              name="familyRoom"
              value={formData.familyRoom}
              onChange={onChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="adjustment">Adjustment *</label>
            <input
              type="number"
              id="adjustment"
              name="adjustment"
              value={formData.adjustment}
              onChange={onChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="kids">Kids (Total from all locations) *</label>
            <input
              type="number"
              id="kids"
              name="kids"
              value={formData.kids}
              onChange={onChange}
              min="0"
              required
            />
          </div>
        </div>
      )}

      {/* Silicon Valley University */}
      {formData.location === 'silicon-valley-university' && (
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="leftWingLeftColumn">Left Wing Left Column *</label>
            <input
              type="number"
              id="leftWingLeftColumn"
              name="leftWingLeftColumn"
              value={formData.leftWingLeftColumn}
              onChange={onChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="leftWingRightColumn">Left Wing Right Column *</label>
            <input
              type="number"
              id="leftWingRightColumn"
              name="leftWingRightColumn"
              value={formData.leftWingRightColumn}
              onChange={onChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="rightWingLeftColumn">Right Wing Left Column *</label>
            <input
              type="number"
              id="rightWingLeftColumn"
              name="rightWingLeftColumn"
              value={formData.rightWingLeftColumn}
              onChange={onChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="rightWingRightColumn">Right Wing Right Column *</label>
            <input
              type="number"
              id="rightWingRightColumn"
              name="rightWingRightColumn"
              value={formData.rightWingRightColumn}
              onChange={onChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="svuFamilyOverflow">Family / Overflow Room *</label>
            <input
              type="number"
              id="svuFamilyOverflow"
              name="svuFamilyOverflow"
              value={formData.svuFamilyOverflow}
              onChange={onChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="adjustment">Adjustment *</label>
            <input
              type="number"
              id="adjustment"
              name="adjustment"
              value={formData.adjustment}
              onChange={onChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="kids">Kids (Total from all locations) *</label>
            <input
              type="number"
              id="kids"
              name="kids"
              value={formData.kids}
              onChange={onChange}
              min="0"
              required
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AttendanceFormSections;
