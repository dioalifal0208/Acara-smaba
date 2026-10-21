"""Regression checks for the parity gate; no participant images are used."""
import json
import unittest

import numpy as np

import convert_tflite as conversion


class ParityGateTest(unittest.TestCase):
    def test_rejects_nonfinite_shape_mismatch_and_zero_descriptor(self):
        for actual in ([float("nan"), 1], [float("inf"), 1], [0, 0], [1, 2, 3]):
            with self.subTest(actual=actual), self.assertRaises(ValueError):
                conversion.compare(actual, [1, 2])

    def test_compare_detects_raw_scaling_even_when_l2_distance_is_zero(self):
        stats = conversion.compare([2, 4], [1, 2])
        self.assertGreater(stats["max_abs"], conversion.TOL_ELEMENT)
        self.assertAlmostEqual(0.0, stats["l2_distance"])

    def test_center_padding_matches_js_round_for_odd_difference(self):
        image = np.ones((2, 5, 3), dtype=np.uint8)
        square = conversion.pad_to_square(image)
        self.assertEqual((5, 5, 3), square.shape)
        np.testing.assert_array_equal(square[1:3], image)
        self.assertTrue((square[:1] == 0).all())
        self.assertTrue((square[3:] == 0).all())

    def test_resize_uses_legacy_tensor_coordinates_and_keeps_raw_rgb(self):
        image = np.array([[[0, 0, 0], [100, 100, 100]],
                          [[200, 200, 200], [240, 240, 240]]], dtype=np.uint8)
        resized = conversion.to_square_input(image, 4)
        self.assertEqual(np.float32, resized.dtype)
        self.assertEqual((1, 4, 4, 3), resized.shape)
        self.assertEqual(50.0, float(resized[0, 0, 1, 0]))
        self.assertEqual(240.0, float(resized[0, -1, -1, 0]))

    def test_alignment_matches_web_edge_and_center_fixtures(self):
        fixtures = json.loads(conversion.FIXTURES.read_text(encoding="utf-8"))
        for case in fixtures["alignment_cases"]:
            points = np.zeros((68, 2), dtype=np.float64)
            for key, start, end in [
                ("left_eye_center", 36, 42),
                ("right_eye_center", 42, 48),
                ("mouth_center", 48, 68),
            ]:
                points[start:end] = [case[key]["x"], case[key]["y"]]
            self.assertEqual(
                case["expected_rect"],
                conversion.dlib_rect(points, case["image"]["width"], case["image"]["height"]),
            )


if __name__ == "__main__":
    unittest.main()
